import Expense from "../models/Expense.js";
import { detectExpenseAnomalies } from "./anomalyDetectionService.js";

/* =========================================================
   METRICS
========================================================= */

const calculateMAE = (actual, predicted) => {
    if (!actual.length || actual.length !== predicted.length) return 0;

    const error = actual.reduce((sum, value, index) => {
        return sum + Math.abs(value - predicted[index]);
    }, 0);

    return error / actual.length;
};

const calculateRMSE = (actual, predicted) => {
    if (!actual.length || actual.length !== predicted.length) return 0;

    const error = actual.reduce((sum, value, index) => {
        return sum + Math.pow(value - predicted[index], 2);
    }, 0);

    return Math.sqrt(error / actual.length);
};

/* =========================================================
   DAILY SERIES
========================================================= */

const createDailySeries = (expenses) => {
    if (!expenses.length) return [];

    const sorted = [...expenses].sort(
        (a, b) => new Date(a.expenseDate) - new Date(b.expenseDate)
    );

    const firstDate = new Date(sorted[0].expenseDate);
    const lastDate = new Date(sorted[sorted.length - 1].expenseDate);

    firstDate.setHours(0, 0, 0, 0);
    lastDate.setHours(0, 0, 0, 0);

    const amountByDate = new Map();

    sorted.forEach((expense) => {
        const date = new Date(expense.expenseDate);
        date.setHours(0, 0, 0, 0);

        const key = date.toISOString().split("T")[0];

        amountByDate.set(
            key,
            (amountByDate.get(key) || 0) + Number(expense.amount || 0)
        );
    });

    const series = [];

    const currentDate = new Date(firstDate);
    let dayIndex = 0;

    while (currentDate <= lastDate) {
        const key = currentDate.toISOString().split("T")[0];

        series.push({
            date: key,
            amount: amountByDate.get(key) || 0,
            dayIndex
        });

        currentDate.setDate(currentDate.getDate() + 1);
        dayIndex++;
    }

    return series;
};

/* =========================================================
   LINEAR TREND REGRESSION
========================================================= */

const calculateLinearRegression = (series) => {
    if (!series.length) {
        return {
            slope: 0,
            intercept: 0
        };
    }

    const n = series.length;

    const sumX = series.reduce((sum, item) => sum + item.dayIndex, 0);

    const sumY = series.reduce((sum, item) => sum + item.amount, 0);

    const sumXY = series.reduce(
        (sum, item) => sum + item.dayIndex * item.amount,
        0
    );

    const sumX2 = series.reduce(
        (sum, item) => sum + item.dayIndex * item.dayIndex,
        0
    );

    const denominator = n * sumX2 - sumX * sumX;

    if (denominator === 0) {
        return {
            slope: 0,
            intercept: sumY / n
        };
    }

    const slope =
        (n * sumXY - sumX * sumY) /
        denominator;

    const intercept =
        (sumY - slope * sumX) / n;

    return {
        slope,
        intercept
    };
};

/* =========================================================
   PREDICT
========================================================= */

const predictSeries = (series, model) => {
    return series.map((item) => {
        const prediction =
            model.intercept +
            model.slope * item.dayIndex;

        return Math.max(0, prediction);
    });
};

/* =========================================================
   EVALUATION
========================================================= */

const evaluateModel = (series) => {
    if (series.length < 5) {
        return {
            mae: 0,
            rmse: 0,
            trainSize: series.length,
            testSize: 0
        };
    }

    const splitIndex = Math.max(
        1,
        Math.floor(series.length * 0.8)
    );

    const train = series.slice(0, splitIndex);
    const test = series.slice(splitIndex);

    if (!test.length) {
        return {
            mae: 0,
            rmse: 0,
            trainSize: train.length,
            testSize: 0
        };
    }

    const model = calculateLinearRegression(train);

    const predictions = test.map((item) => {
        const prediction =
            model.intercept +
            model.slope * item.dayIndex;

        return Math.max(0, prediction);
    });

    const actual = test.map((item) => item.amount);

    return {
        mae: calculateMAE(actual, predictions),
        rmse: calculateRMSE(actual, predictions),
        trainSize: train.length,
        testSize: test.length,
        actual,
        predictions
    };
};

/* =========================================================
   30-DAY FORECAST
========================================================= */

const calculate30DayForecast = (series, model) => {
    if (!series.length) return 0;

    const lastDayIndex =
        series[series.length - 1].dayIndex;

    let total = 0;

    for (let i = 1; i <= 30; i++) {
        const futureDayIndex =
            lastDayIndex + i;

        const prediction =
            model.intercept +
            model.slope * futureDayIndex;

        total += Math.max(0, prediction);
    }

    return total;
};

/* =========================================================
   ANOMALY FILTERING
   ---------------------------------------------------------
   IMPORTANT:
   Forecasting DOES NOT calculate anomalies itself.

   It consumes the exact result generated by:
   detectExpenseAnomalies()

   This makes the hybrid anomaly detector the
   single source of truth.
========================================================= */

const createAnomalyAwareSeries = (
    series,
    expenses,
    anomalyResult
) => {
    const anomalyIds = new Set(
        (anomalyResult?.anomalies || []).map(
            (item) => String(item._id || item.id)
        )
    );

    const anomalyDates = new Set();

    expenses.forEach((expense) => {
        const id = String(expense._id);

        if (anomalyIds.has(id)) {
            const date = new Date(expense.expenseDate);

            date.setHours(0, 0, 0, 0);

            const key = date.toISOString().split("T")[0];

            anomalyDates.add(key);
        }
    });

    return series.map((item) => {
        if (anomalyDates.has(item.date)) {
            return {
                ...item,
                amount: 0,
                wasAnomalyRemoved: true
            };
        }

        return {
            ...item,
            wasAnomalyRemoved: false
        };
    });
};

/* =========================================================
   MAIN FORECAST SERVICE
========================================================= */

export const getExpenseForecast = async (userId) => {

    /* -----------------------------------------------------
       1. GET EXPENSE DATA
    ----------------------------------------------------- */

    const expenses = await Expense.find({
        user: userId,
        type: "expense"
    })
        .sort({ expenseDate: 1 })
        .lean();

    if (expenses.length < 7) {
        return {
            success: false,
            status: "INSUFFICIENT_DATA",
            message:
                "At least 7 expense transactions are required for forecasting.",
            requiredTransactions: 7,
            availableTransactions: expenses.length
        };
    }

    /* -----------------------------------------------------
       2. CREATE DAILY SERIES
    ----------------------------------------------------- */

    const rawSeries = createDailySeries(expenses);

    if (rawSeries.length < 5) {
        return {
            success: false,
            status: "INSUFFICIENT_DATA",
            message:
                "At least 5 daily observations are required for forecasting.",
            dailyObservations: rawSeries.length
        };
    }

    /* -----------------------------------------------------
       3. SINGLE SOURCE OF TRUTH:
          HYBRID ANOMALY DETECTION
    ----------------------------------------------------- */

    const anomalyResult =
        await detectExpenseAnomalies(userId);

    const detectedAnomalies =
        anomalyResult?.anomalies || [];

    /* -----------------------------------------------------
       4. ANOMALY-AWARE SERIES
    ----------------------------------------------------- */

    const anomalyAwareSeries =
        createAnomalyAwareSeries(
            rawSeries,
            expenses,
            anomalyResult
        );

    /* -----------------------------------------------------
       5. RAW MODEL
    ----------------------------------------------------- */

    const rawModel =
        calculateLinearRegression(rawSeries);

    const rawEvaluation =
        evaluateModel(rawSeries);

    const raw30DayForecast =
        calculate30DayForecast(
            rawSeries,
            rawModel
        );

    /* -----------------------------------------------------
       6. ANOMALY-AWARE MODEL
    ----------------------------------------------------- */

    const anomalyAwareModel =
        calculateLinearRegression(
            anomalyAwareSeries
        );

    const anomalyAwareEvaluation =
        evaluateModel(
            anomalyAwareSeries
        );

    const anomalyAware30DayForecast =
        calculate30DayForecast(
            anomalyAwareSeries,
            anomalyAwareModel
        );

    /* -----------------------------------------------------
       7. NEXT-DAY FORECAST
    ----------------------------------------------------- */

    const lastDayIndex =
        rawSeries[rawSeries.length - 1].dayIndex;

    const nextDayIndex =
        lastDayIndex + 1;

    const rawNextDayForecast =
        Math.max(
            0,
            rawModel.intercept +
                rawModel.slope * nextDayIndex
        );

    const anomalyAwareNextDayForecast =
        Math.max(
            0,
            anomalyAwareModel.intercept +
                anomalyAwareModel.slope *
                    nextDayIndex
        );

    /* -----------------------------------------------------
       8. MAE IMPROVEMENT
    ----------------------------------------------------- */

    let maeImprovement = 0;

    if (rawEvaluation.mae > 0) {
        maeImprovement =
            (
                (
                    rawEvaluation.mae -
                    anomalyAwareEvaluation.mae
                ) /
                rawEvaluation.mae
            ) * 100;
    }

    /* -----------------------------------------------------
       9. FINAL RESULT
    ----------------------------------------------------- */

    return {

        model:
            "Anomaly-Aware Linear Trend Forecasting",

        methodology: {
            anomalyDetection:
                "Isolation Forest + Z-score Hybrid",

            anomalyDetectionSource:
                "detectExpenseAnomalies()",

            forecastingModel:
                "Linear Trend Regression",

            anomalyHandling:
                "Confirmed anomalies removed before anomaly-aware forecasting",

            dataSplit:
                "80/20 time-aware split"
        },

        dataSummary: {
            totalTransactions:
                expenses.length,

            dailyObservations:
                rawSeries.length,

            anomalyCount:
                detectedAnomalies.length
        },

        anomalyDetection: {
            model:
                anomalyResult?.model ||
                "Isolation Forest + Z-score Hybrid",

            totalTransactions:
                anomalyResult?.totalTransactions ||
                expenses.length,

            anomalyCount:
                detectedAnomalies.length,

            anomalyRate:
                anomalyResult?.statistics?.anomalyRate ||
                0,

            anomalies:
                detectedAnomalies
        },

        forecast: {

            nextDay: {
                raw:
                    Number(
                        rawNextDayForecast.toFixed(2)
                    ),

                anomalyAware:
                    Number(
                        anomalyAwareNextDayForecast.toFixed(2)
                    )
            },

            thirtyDay: {
                raw:
                    Number(
                        raw30DayForecast.toFixed(2)
                    ),

                anomalyAware:
                    Number(
                        anomalyAware30DayForecast.toFixed(2)
                    )
            }
        },

        evaluation: {

            raw: {
                mae:
                    Number(
                        rawEvaluation.mae.toFixed(2)
                    ),

                rmse:
                    Number(
                        rawEvaluation.rmse.toFixed(2)
                    ),

                trainSize:
                    rawEvaluation.trainSize,

                testSize:
                    rawEvaluation.testSize
            },

            anomalyAware: {
                mae:
                    Number(
                        anomalyAwareEvaluation.mae.toFixed(2)
                    ),

                rmse:
                    Number(
                        anomalyAwareEvaluation.rmse.toFixed(2)
                    ),

                trainSize:
                    anomalyAwareEvaluation.trainSize,

                testSize:
                    anomalyAwareEvaluation.testSize
            },

            maeImprovement:
                Number(
                    maeImprovement.toFixed(2)
                )
        },

        modelParameters: {

            raw: {
                slope:
                    Number(
                        rawModel.slope.toFixed(6)
                    ),

                intercept:
                    Number(
                        rawModel.intercept.toFixed(2)
                    )
            },

            anomalyAware: {
                slope:
                    Number(
                        anomalyAwareModel.slope.toFixed(6)
                    ),

                intercept:
                    Number(
                        anomalyAwareModel.intercept.toFixed(2)
                    )
            }
        },

        historicalData:
            rawSeries,

        anomalyAwareHistoricalData:
            anomalyAwareSeries
    };
};