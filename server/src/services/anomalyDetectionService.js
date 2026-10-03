import Expense from "../models/Expense.js";
import { IsolationForest } from "isolation-forest";

/**
 * Calculate mean of an array
 */
const calculateMean = (values) => {
    if (!values.length) return 0;

    return values.reduce((sum, value) => sum + value, 0) / values.length;
};

/**
 * Calculate standard deviation
 */
const calculateStandardDeviation = (values, mean) => {
    if (values.length <= 1) return 0;

    const variance =
        values.reduce((sum, value) => {
            return sum + Math.pow(value - mean, 2);
        }, 0) / values.length;

    return Math.sqrt(variance);
};

/**
 * Calculate Z-score
 */
const calculateZScore = (value, mean, standardDeviation) => {
    if (standardDeviation === 0) return 0;

    return (value - mean) / standardDeviation;
};

/**
 * Determine risk level
 */
const getRiskLevel = (zScore, isolationScore, isAnomaly) => {
    if (!isAnomaly) {
        return "LOW";
    }

    if (Math.abs(zScore) >= 4 || isolationScore >= 0.8) {
        return "HIGH";
    }

    return "MEDIUM";
};

/**
 * Generate explanation
 */
const generateExplanation = ({
    amount,
    zScore,
    isolationScore,
    statisticalAnomaly,
    isolationAnomaly
}) => {
    if (statisticalAnomaly && isolationAnomaly) {
        return "Transaction is confirmed as unusual by both statistical analysis and Isolation Forest.";
    }

    if (statisticalAnomaly) {
        return "Transaction amount is significantly higher than the user's normal spending pattern.";
    }

    if (isolationAnomaly) {
        return "Isolation Forest identified this transaction as structurally unusual within the spending pattern.";
    }

    if (amount > 0 && Math.abs(zScore) >= 2) {
        return "Transaction amount is moderately different from the user's normal spending pattern.";
    }

    return "Transaction follows the detected spending pattern.";
};

/**
 * Hybrid Expense Anomaly Detection
 *
 * Primary ML model:
 *      Isolation Forest
 *
 * Deterministic confirmation:
 *      Z-score
 *
 * Final decision:
 *      Isolation Forest anomaly
 *      AND
 *      statistical confirmation
 *
 * This makes the final anomaly decision deterministic
 * while keeping Isolation Forest as the primary ML model.
 */
export const detectExpenseAnomalies = async (userId) => {
    const expenses = await Expense.find({
        user: userId,
        type: "expense"
    })
        .sort({ expenseDate: 1 })
        .lean();

    console.log("ANOMALY USER:", userId);
    console.log("ANOMALY EXPENSE COUNT:", expenses.length);

    if (expenses.length < 5) {
        return {
            success: false,
            status: "INSUFFICIENT_DATA",
            message:
                "At least 5 expense transactions are required for anomaly detection.",
            model: "Isolation Forest + Z-score Hybrid",
            totalTransactions: expenses.length,
            anomalies: [],
            transactions: []
        };
    }

    console.log(
        "ANOMALY EXPENSES:",
        expenses.map((expense) => ({
            title: expense.title,
            amount: expense.amount,
            type: expense.type
        }))
    );

    /*
     * ---------------------------------------------------------
     * 1. BASIC AMOUNT DATA
     * ---------------------------------------------------------
     */

    const amounts = expenses.map((expense) => Number(expense.amount) || 0);

    const mean = calculateMean(amounts);

    const standardDeviation = calculateStandardDeviation(
        amounts,
        mean
    );

    /*
     * ---------------------------------------------------------
     * 2. FEATURE ENGINEERING
     * ---------------------------------------------------------
     *
     * Features:
     * amount
     * z-score
     * day of week
     * day of month
     * days since previous transaction
     */

    const trainingData = [];

    expenses.forEach((expense, index) => {
        const currentDate = new Date(expense.expenseDate);

        const previousDate =
            index > 0
                ? new Date(expenses[index - 1].expenseDate)
                : currentDate;

        const daysSincePrevious =
            index > 0
                ? Math.max(
                      0,
                      (currentDate - previousDate) /
                          (1000 * 60 * 60 * 24)
                  )
                : 0;

        const amount = Number(expense.amount) || 0;

        const zScore = calculateZScore(
            amount,
            mean,
            standardDeviation
        );

        trainingData.push([
            amount,
            zScore,
            currentDate.getDay(),
            currentDate.getDate(),
            daysSincePrevious
        ]);
    });

    /*
     * ---------------------------------------------------------
     * 3. ISOLATION FOREST
     * ---------------------------------------------------------
     */

    const forest = new IsolationForest(
        100,
        Math.min(256, trainingData.length)
    );

    forest.fit(trainingData);

    const isolationScores = forest.scores();

    /*
     * ---------------------------------------------------------
     * 4. HYBRID DECISION
     * ---------------------------------------------------------
     *
     * Isolation Forest remains the primary ML detector.
     *
     * Z-score provides deterministic statistical confirmation.
     *
     * Threshold:
     *
     * |Z| >= 2.5
     *
     * This is deliberately used as confirmation rather than
     * replacing the ML model.
     */

    const ISOLATION_THRESHOLD = 0.60;

const Z_SCORE_CONFIRMATION_THRESHOLD = 2.5;

    const transactions = expenses.map((expense, index) => {
        const amount = Number(expense.amount) || 0;

        const zScore = calculateZScore(
            amount,
            mean,
            standardDeviation
        );

        const isolationScore =
            Number(isolationScores[index]) || 0;

        const isolationAnomaly =
            isolationScore >= ISOLATION_THRESHOLD;

        const statisticalAnomaly =
            Math.abs(zScore) >=
            Z_SCORE_CONFIRMATION_THRESHOLD;

        /*
         * FINAL DETERMINISTIC DECISION
         *
         * Both conditions must be satisfied.
         */
        const isAnomaly =
            isolationAnomaly && statisticalAnomaly;

        const riskLevel = getRiskLevel(
            zScore,
            isolationScore,
            isAnomaly
        );

        const explanation = generateExplanation({
            amount,
            zScore,
            isolationScore,
            statisticalAnomaly,
            isolationAnomaly
        });

        return {
            transactionId: expense._id,
            title: expense.title,
            amount,
            category: expense.category,
            paymentMethod: expense.paymentMethod,
            expenseDate: expense.expenseDate,

            anomalyScore: Number(
                isolationScore.toFixed(4)
            ),

            zScore: Number(zScore.toFixed(4)),

            isolationAnomaly,
            statisticalAnomaly,

            isAnomaly,

            riskLevel,

            explanation
        };
    });

    /*
     * ---------------------------------------------------------
     * 5. FINAL ANOMALIES
     * ---------------------------------------------------------
     */

    const anomalies = transactions.filter(
        (transaction) => transaction.isAnomaly
    );

    const anomalyCount = anomalies.length;

    const normalTransactionCount =
        transactions.length - anomalyCount;

    const anomalyRate =
        transactions.length > 0
            ? (anomalyCount / transactions.length) * 100
            : 0;

    /*
     * ---------------------------------------------------------
     * 6. BASELINE STATISTICS
     * ---------------------------------------------------------
     */

    const maximumExpense =
        amounts.length > 0
            ? Math.max(...amounts)
            : 0;

    const minimumExpense =
        amounts.length > 0
            ? Math.min(...amounts)
            : 0;

    /*
     * ---------------------------------------------------------
     * 7. LOG RESULT
     * ---------------------------------------------------------
     */

    console.log(
        "HYBRID ANOMALY RESULTS:",
        transactions.map((transaction) => ({
            title: transaction.title,
            amount: transaction.amount,
            isolationScore: transaction.anomalyScore,
            zScore: transaction.zScore,
            isolationAnomaly:
                transaction.isolationAnomaly,
            statisticalAnomaly:
                transaction.statisticalAnomaly,
            finalAnomaly:
                transaction.isAnomaly,
            riskLevel:
                transaction.riskLevel
        }))
    );

    console.log(
        "FINAL HYBRID ANOMALY COUNT:",
        anomalyCount
    );

    /*
     * ---------------------------------------------------------
     * 8. RETURN RESEARCH-FRIENDLY RESPONSE
     * ---------------------------------------------------------
     */

    return {
        model: "Isolation Forest + Z-score Hybrid",

        modelParameters: {
            isolationForestEstimators: 100,
            sampleSize: Math.min(
                256,
                trainingData.length
            ),
            isolationThreshold:
                ISOLATION_THRESHOLD,
            zScoreConfirmationThreshold:
                Z_SCORE_CONFIRMATION_THRESHOLD
        },

        decisionMethod:
            "Isolation Forest anomaly AND deterministic Z-score confirmation",

        totalTransactions: transactions.length,

        statistics: {
            anomalyCount,
            normalTransactionCount,
            anomalyRate: Number(
                anomalyRate.toFixed(2)
            )
        },

        baseline: {
            averageExpense: Number(
                mean.toFixed(2)
            ),

            standardDeviation: Number(
                standardDeviation.toFixed(2)
            ),

            minimumExpense,

            maximumExpense
        },

        anomalies,

        transactions
    };
};