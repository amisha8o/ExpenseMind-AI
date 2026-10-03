import ResearchTransaction
    from "../models/ResearchTransaction.js";

import {
    IsolationForest
} from "isolation-forest";


/* =========================================================
   EXPERIMENT CONFIGURATION
========================================================= */

const TRAIN_RATIO = 0.80;

const Z_SCORE_THRESHOLD = 2.5;

const ISOLATION_THRESHOLD = 0.55;

const ISOLATION_TREES = 100;


/* =========================================================
   BASIC STATISTICS
========================================================= */

const getMean = (values) => {

    if (!values.length) {
        return 0;
    }

    return (
        values.reduce(
            (sum, value) =>
                sum + Number(value),
            0
        ) / values.length
    );
};


const getStandardDeviation = (
    values,
    mean
) => {

    if (values.length <= 1) {
        return 0;
    }

    const variance =
        values.reduce(
            (sum, value) =>
                sum +
                Math.pow(
                    Number(value) - mean,
                    2
                ),
            0
        ) / values.length;

    return Math.sqrt(variance);
};


/* =========================================================
   ERROR METRICS
========================================================= */

const getMAE = (
    actual,
    predicted
) => {

    if (!actual.length) {
        return 0;
    }

    return (
        actual.reduce(
            (sum, value, index) =>
                sum +
                Math.abs(
                    Number(value) -
                    Number(predicted[index])
                ),
            0
        ) / actual.length
    );
};


const getRMSE = (
    actual,
    predicted
) => {

    if (!actual.length) {
        return 0;
    }

    const mse =
        actual.reduce(
            (sum, value, index) =>
                sum +
                Math.pow(
                    Number(value) -
                    Number(predicted[index]),
                    2
                ),
            0
        ) / actual.length;

    return Math.sqrt(mse);
};


/* =========================================================
   DATE HELPERS
========================================================= */

const dateKey = (date) => {

    return new Date(date)
        .toISOString()
        .split("T")[0];
};


const addDays = (
    date,
    days
) => {

    const result =
        new Date(date);

    result.setUTCDate(
        result.getUTCDate() + days
    );

    return result;
};


/* =========================================================
   DAILY AGGREGATION
========================================================= */

const createDailySeries = (
    expenses,
    startDate,
    endDate
) => {

    const dailyMap = {};

    expenses.forEach(
        (expense) => {

            const key =
                dateKey(expense.date);

            if (!dailyMap[key]) {
                dailyMap[key] = 0;
            }

            dailyMap[key] +=
                Number(expense.amount || 0);
        }
    );


    const result = [];

    let currentDate =
        new Date(startDate);

    let dayIndex = 1;


    while (
        currentDate <= endDate
    ) {

        const key =
            dateKey(currentDate);

        result.push({

            date: key,

            amount:
                Number(
                    (
                        dailyMap[key] || 0
                    ).toFixed(2)
                ),

            dayIndex

        });


        currentDate =
            addDays(
                currentDate,
                1
            );

        dayIndex++;
    }


    return result;
};


/* =========================================================
   LINEAR TREND REGRESSION
========================================================= */

const trainLinearTrend = (
    trainingData
) => {

    if (
        trainingData.length < 2
    ) {

        return {
            slope: 0,
            intercept:
                trainingData[0]
                    ?.amount || 0
        };
    }


    const xValues =
        trainingData.map(
            item => item.dayIndex
        );

    const yValues =
        trainingData.map(
            item => item.amount
        );


    const xMean =
        getMean(xValues);

    const yMean =
        getMean(yValues);


    let numerator = 0;

    let denominator = 0;


    for (
        let i = 0;
        i < trainingData.length;
        i++
    ) {

        numerator +=
            (
                xValues[i] -
                xMean
            ) *
            (
                yValues[i] -
                yMean
            );


        denominator +=
            Math.pow(
                xValues[i] -
                xMean,
                2
            );
    }


    const slope =
        denominator === 0
            ? 0
            : numerator /
              denominator;


    const intercept =
        yMean -
        slope * xMean;


    return {
        slope,
        intercept
    };
};


/* =========================================================
   PREDICTION
========================================================= */

const predict = (
    model,
    dayIndex
) => {

    return Math.max(
        0,
        model.intercept +
        model.slope * dayIndex
    );
};


/* =========================================================
   TRAINING-ONLY ANOMALY DETECTION
========================================================= */

const detectTrainingAnomalies = (
    trainingExpenses
) => {

    if (
        trainingExpenses.length < 5
    ) {

        return {
            anomalyIds: new Set(),
            statistics: {
                mean: 0,
                standardDeviation: 0
            }
        };
    }


    const amounts =
        trainingExpenses.map(
            expense =>
                Number(expense.amount)
        );


    const mean =
        getMean(amounts);


    const standardDeviation =
        getStandardDeviation(
            amounts,
            mean
        );


    /*
     * -----------------------------------------
     * Z-SCORE
     * -----------------------------------------
     */

    const zScores =
        trainingExpenses.map(
            expense => {

                if (
                    standardDeviation === 0
                ) {
                    return 0;
                }

                return (
                    Number(expense.amount) -
                    mean
                ) /
                standardDeviation;
            }
        );


    /*
     * -----------------------------------------
     * ISOLATION FOREST FEATURES
     * -----------------------------------------
     */

    const features = [];

    let previousDate = null;


    for (
        let i = 0;
        i < trainingExpenses.length;
        i++
    ) {

        const expense =
            trainingExpenses[i];

        const currentDate =
            new Date(expense.date);


        let daysSincePrevious = 0;


        if (previousDate) {

            daysSincePrevious =
                (
                    currentDate.getTime() -
                    previousDate.getTime()
                ) /
                (
                    1000 *
                    60 *
                    60 *
                    24
                );
        }


        features.push([

            Number(
                expense.amount
            ),

            Number(
                zScores[i]
            ),

            currentDate.getUTCDay(),

            currentDate.getUTCDate(),

            Number(
                daysSincePrevious
            )

        ]);


        previousDate =
            currentDate;
    }


    /*
     * -----------------------------------------
     * ISOLATION FOREST
     * -----------------------------------------
     */

    const isolationForest =
        new IsolationForest(
            ISOLATION_TREES,
            Math.min(
                256,
                features.length
            )
        );


    isolationForest.fit(
        features
    );


    const isolationScores =
        isolationForest.scores();


    /*
     * -----------------------------------------
     * HYBRID DECISION
     *
     * Both detectors must agree.
     * -----------------------------------------
     */

    const anomalyIds =
        new Set();


    for (
        let i = 0;
        i < trainingExpenses.length;
        i++
    ) {

        const statisticalAnomaly =
            Math.abs(
                zScores[i]
            ) >=
            Z_SCORE_THRESHOLD;


        const isolationAnomaly =
            Number(
                isolationScores[i]
            ) >=
            ISOLATION_THRESHOLD;


        const hybridAnomaly =
            statisticalAnomaly &&
            isolationAnomaly;


        if (hybridAnomaly) {

            anomalyIds.add(
                String(
                    trainingExpenses[i]
                        .transactionId
                )
            );
        }
    }


    return {

        anomalyIds,

        statistics: {

            mean:
                Number(
                    mean.toFixed(2)
                ),

            standardDeviation:
                Number(
                    standardDeviation
                        .toFixed(2)
                )

        }
    };
};


/* =========================================================
   REMOVE ONLY ANOMALOUS TRANSACTION AMOUNTS
========================================================= */

const createAnomalyAdjustedExpenses = (
    expenses,
    anomalyIds
) => {

    return expenses.map(
        expense => {

            const id =
                String(
                    expense.transactionId
                );


            if (
                anomalyIds.has(id)
            ) {

                return {

                    ...expense,

                    /*
                     * IMPORTANT:
                     * Only this transaction
                     * becomes zero.
                     *
                     * Other transactions on
                     * the same day remain.
                     */

                    amount: 0,

                    removedAsAnomaly: true

                };
            }


            return {

                ...expense,

                removedAsAnomaly: false

            };
        }
    );
};


/* =========================================================
   EVALUATE FORECAST
========================================================= */

const evaluateForecast = (
    trainingData,
    testingData
) => {

    const model =
        trainLinearTrend(
            trainingData
        );


    const predictions =
        testingData.map(
            item =>
                Number(
                    predict(
                        model,
                        item.dayIndex
                    ).toFixed(2)
                )
        );


    const actual =
        testingData.map(
            item =>
                Number(
                    item.amount
                )
        );


    return {

        modelParameters: {

            slope:
                Number(
                    model.slope.toFixed(6)
                ),

            intercept:
                Number(
                    model.intercept.toFixed(6)
                )

        },

        MAE:
            Number(
                getMAE(
                    actual,
                    predictions
                ).toFixed(2)
            ),

        RMSE:
            Number(
                getRMSE(
                    actual,
                    predictions
                ).toFixed(2)
            ),

        predictions

    };
};


/* =========================================================
   MAIN RESEARCH EXPERIMENT
========================================================= */

export const evaluateExpenseForecasting =
    async () => {

        /*
         * ======================================
         * LOAD RESEARCH DATASET
         * ======================================
         */

        const transactions =
            await ResearchTransaction
                .find({
                    type: "expense"
                })
                .sort({
                    date: 1
                })
                .lean();


        if (
            transactions.length < 20
        ) {

            throw new Error(
                "At least 20 research expense transactions are required."
            );
        }


        /*
         * ======================================
         * DATA RANGE
         * ======================================
         */

        const firstDate =
            new Date(
                transactions[0].date
            );


        const lastDate =
            new Date(
                transactions[
                    transactions.length - 1
                ].date
            );


        /*
         * ======================================
         * DAILY SERIES
         * ======================================
         */

        const dailyData =
            createDailySeries(
                transactions,
                firstDate,
                lastDate
            );


        if (
            dailyData.length < 10
        ) {

            throw new Error(
                "At least 10 daily observations are required."
            );
        }


        /*
         * ======================================
         * CHRONOLOGICAL 80/20 SPLIT
         * ======================================
         */

        const splitIndex =
            Math.max(
                1,
                Math.floor(
                    dailyData.length *
                    TRAIN_RATIO
                )
            );


        const trainingDailyData =
            dailyData.slice(
                0,
                splitIndex
            );


        const testingDailyData =
            dailyData.slice(
                splitIndex
            );


        /*
         * ======================================
         * TRAINING DATE BOUNDARY
         * ======================================
         */

        const trainingEndDate =
            new Date(
                trainingDailyData[
                    trainingDailyData.length - 1
                ].date
            );


        /*
         * ======================================
         * TRANSACTION SPLIT
         *
         * Transactions are separated by
         * chronological date.
         * ======================================
         */

        const trainingExpenses =
            transactions.filter(
                transaction =>
                    new Date(
                        transaction.date
                    ) <=
                    trainingEndDate
            );


        const testingExpenses =
            transactions.filter(
                transaction =>
                    new Date(
                        transaction.date
                    ) >
                    trainingEndDate
            );


        /*
         * ======================================
         * RAW FORECAST
         * ======================================
         */

        const rawEvaluation =
            evaluateForecast(
                trainingDailyData,
                testingDailyData
            );


        /*
         * ======================================
         * DETECT ANOMALIES
         *
         * TRAINING DATA ONLY
         * ======================================
         */

        const anomalyDetection =
            detectTrainingAnomalies(
                trainingExpenses
            );


        /*
         * ======================================
         * ANOMALY-ADJUSTED TRAINING DATA
         * ======================================
         */

        const adjustedTrainingExpenses =
            createAnomalyAdjustedExpenses(
                trainingExpenses,
                anomalyDetection.anomalyIds
            );


        /*
         * ======================================
         * REBUILD DAILY TRAINING SERIES
         * ======================================
         */

        const adjustedTrainingDailyData =
            createDailySeries(
                adjustedTrainingExpenses,
                firstDate,
                trainingEndDate
            );


        /*
         * ======================================
         * ANOMALY-AWARE FORECAST
         * ======================================
         */

        const anomalyAwareEvaluation =
            evaluateForecast(
                adjustedTrainingDailyData,
                testingDailyData
            );


        /*
         * ======================================
         * IMPROVEMENT
         * ======================================
         */

        const maeImprovement =
            rawEvaluation.MAE > 0
                ? (
                    (
                        rawEvaluation.MAE -
                        anomalyAwareEvaluation.MAE
                    ) /
                    rawEvaluation.MAE
                ) * 100
                : 0;


        const rmseImprovement =
            rawEvaluation.RMSE > 0
                ? (
                    (
                        rawEvaluation.RMSE -
                        anomalyAwareEvaluation.RMSE
                    ) /
                    rawEvaluation.RMSE
                ) * 100
                : 0;


        /*
         * ======================================
         * ACTUAL TEST ANOMALIES
         *
         * REPORT ONLY.
         *
         * NOT USED FOR TRAINING.
         * ======================================
         */

        const actualTestAnomalies =
            testingExpenses.filter(
                transaction =>
                    Number(
                        transaction.actualAnomaly
                    ) === 1
            );


        /*
         * ======================================
         * TEST ACTUAL VALUES
         * ======================================
         */

        const actualTestValues =
            testingDailyData.map(
                item =>
                    Number(
                        item.amount
                    )
            );


        /*
         * ======================================
         * DAILY RESULT TABLE
         * ======================================
         */

        const dailyResults =
            testingDailyData.map(
                (item, index) => ({

                    date:
                        item.date,

                    actualExpense:
                        Number(
                            item.amount
                        ),

                    rawForecast:
                        rawEvaluation
                            .predictions[index],

                    anomalyAwareForecast:
                        anomalyAwareEvaluation
                            .predictions[index]

                })
            );


        /*
         * ======================================
         * FINAL RESULT
         * ======================================
         */

        return {

            status: "SUCCESS",

            experiment: {

                name:
                    "ExpenseMind Expense Forecasting Experiment",

                version: "1.0",

                dataset:
                    "ExpenseMind Research Dataset",

                totalExpenseTransactions:
                    transactions.length,

                observationDays:
                    dailyData.length,

                trainDays:
                    trainingDailyData.length,

                testDays:
                    testingDailyData.length,

                trainTestSplit:
                    "80% chronological training / 20% chronological testing",

                testDataUsedForTraining:
                    false

            },


            anomalyProcessing: {

                method:
                    "Hybrid Z-Score + Isolation Forest",

                zScoreThreshold:
                    Z_SCORE_THRESHOLD,

                isolationForestThreshold:
                    ISOLATION_THRESHOLD,

                trainingAnomaliesRemoved:
                    anomalyDetection
                        .anomalyIds.size,

                trainingMean:
                    anomalyDetection
                        .statistics.mean,

                trainingStandardDeviation:
                    anomalyDetection
                        .statistics
                        .standardDeviation,

                testAnomaliesObserved:
                    actualTestAnomalies.length,

                testAnomaliesUsedForTraining:
                    false

            },


            models: {

                rawForecast:
                    "Linear Trend Regression",

                anomalyAwareForecast:
                    "Linear Trend Regression on anomaly-adjusted training data"

            },


            evaluation: {

                rawForecast: {

                    MAE:
                        rawEvaluation.MAE,

                    RMSE:
                        rawEvaluation.RMSE,

                    modelParameters:
                        rawEvaluation
                            .modelParameters

                },


                anomalyAwareForecast: {

                    MAE:
                        anomalyAwareEvaluation
                            .MAE,

                    RMSE:
                        anomalyAwareEvaluation
                            .RMSE,

                    modelParameters:
                        anomalyAwareEvaluation
                            .modelParameters

                },


                improvement: {

                    MAE:
                        Number(
                            maeImprovement
                                .toFixed(2)
                        ),

                    RMSE:
                        Number(
                            rmseImprovement
                                .toFixed(2)
                        )

                }

            },


            testActualValues:
                actualTestValues,


            dailyResults

        };
    };