import ResearchTransaction
    from "../models/ResearchTransaction.js";

import {
    IsolationForest
} from "isolation-forest";

const LOCKED_THRESHOLD = 0.55;
const Z_SCORE_THRESHOLD = 2.5;

const TRAIN_SIZE = 140;
const VALIDATION_SIZE = 30;
const TEST_SIZE = 30;

function calculateMean(values) {
    return (
        values.reduce(
            (sum, value) => sum + value,
            0
        ) / values.length
    );
}

function calculateStandardDeviation(
    values,
    mean
) {
    if (values.length <= 1) {
        return 0;
    }

    const variance =
        values.reduce(
            (sum, value) =>
                sum +
                Math.pow(value - mean, 2),
            0
        ) / values.length;

    return Math.sqrt(variance);
}

function calculateMetrics(
    actual,
    predicted
) {
    let TP = 0;
    let TN = 0;
    let FP = 0;
    let FN = 0;

    for (
        let i = 0;
        i < actual.length;
        i++
    ) {
        if (
            actual[i] === 1 &&
            predicted[i] === 1
        ) {
            TP++;
        } else if (
            actual[i] === 0 &&
            predicted[i] === 0
        ) {
            TN++;
        } else if (
            actual[i] === 0 &&
            predicted[i] === 1
        ) {
            FP++;
        } else if (
            actual[i] === 1 &&
            predicted[i] === 0
        ) {
            FN++;
        }
    }

    const precision =
        TP + FP > 0
            ? TP / (TP + FP)
            : 0;

    const recall =
        TP + FN > 0
            ? TP / (TP + FN)
            : 0;

    const f1 =
        precision + recall > 0
            ? (
                2 *
                precision *
                recall
            ) /
            (precision + recall)
            : 0;

    const falsePositiveRate =
        FP + TN > 0
            ? FP / (FP + TN)
            : 0;

    const accuracy =
        actual.length > 0
            ? (TP + TN) /
              actual.length
            : 0;

    return {
        TP,
        TN,
        FP,
        FN,

        precision:
            Number(
                precision.toFixed(4)
            ),

        recall:
            Number(
                recall.toFixed(4)
            ),

        f1Score:
            Number(
                f1.toFixed(4)
            ),

        falsePositiveRate:
            Number(
                falsePositiveRate.toFixed(4)
            ),

        accuracy:
            Number(
                accuracy.toFixed(4)
            )
    };
}

function buildFeatures(
    transactions,
    mean,
    standardDeviation,
    initialPreviousDate = null
) {
    const features = [];

    let previousDate =
        initialPreviousDate;

    for (
        const transaction of transactions
    ) {
        const date =
            new Date(
                transaction.date
            );

        const amount =
            Number(
                transaction.amount
            );

        const zScore =
            standardDeviation > 0
                ? (
                    amount - mean
                ) /
                standardDeviation
                : 0;

        const dayOfWeek =
            date.getUTCDay();

        const dayOfMonth =
            date.getUTCDate();

        let daysSincePrevious = 0;

        if (previousDate) {
            daysSincePrevious =
                (
                    date.getTime() -
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
            amount,
            zScore,
            dayOfWeek,
            dayOfMonth,
            daysSincePrevious
        ]);

        previousDate = date;
    }

    return features;
}

function getActualLabels(
    transactions
) {
    return transactions.map(
        transaction =>
            Number(
                transaction.actualAnomaly
            )
    );
}

export const runFinalAnomalyEvaluation =
    async () => {

        /*
         * ==========================================
         * 1. Load chronological expense dataset
         * ==========================================
         */

        const transactions =
            await ResearchTransaction
                .find({
                    type: "expense"
                })
                .sort({
                    date: 1,
                    transactionId: 1
                })
                .lean();

        const expectedSize =
            TRAIN_SIZE +
            VALIDATION_SIZE +
            TEST_SIZE;

        if (
            transactions.length !==
            expectedSize
        ) {
            throw new Error(
                `Expected ${expectedSize} expense transactions, found ${transactions.length}.`
            );
        }

        /*
         * ==========================================
         * 2. Fixed chronological split
         * ==========================================
         */

        const train =
            transactions.slice(
                0,
                TRAIN_SIZE
            );

        const validation =
            transactions.slice(
                TRAIN_SIZE,
                TRAIN_SIZE +
                VALIDATION_SIZE
            );

        const test =
            transactions.slice(
                TRAIN_SIZE +
                VALIDATION_SIZE,
                expectedSize
            );

        /*
         * ==========================================
         * 3. Verify test set contains expected
         *    ground-truth observations
         * ==========================================
         */

        const testActual =
            getActualLabels(test);

        const testAnomalyCount =
            testActual.filter(
                value => value === 1
            ).length;

        /*
         * ==========================================
         * 4. Z-SCORE
         *
         * IMPORTANT:
         * Parameters are calculated using
         * TRAINING data only.
         * ==========================================
         */

        const trainingAmounts =
            train.map(
                transaction =>
                    Number(
                        transaction.amount
                    )
            );

        const trainingMean =
            calculateMean(
                trainingAmounts
            );

        const trainingStd =
            calculateStandardDeviation(
                trainingAmounts,
                trainingMean
            );

        const zScorePredictions =
            test.map(
                transaction => {

                    const amount =
                        Number(
                            transaction.amount
                        );

                    const zScore =
                        trainingStd > 0
                            ? (
                                amount -
                                trainingMean
                            ) /
                            trainingStd
                            : 0;

                    return Math.abs(
                        zScore
                    ) >=
                    Z_SCORE_THRESHOLD
                        ? 1
                        : 0;
                }
            );

        /*
         * ==========================================
         * 5. ISOLATION FOREST
         *
         * Fit ONLY on training data.
         * ==========================================
         */

        const trainingFeatures =
            buildFeatures(
                train,
                trainingMean,
                trainingStd
            );

        const isolationForest =
            new IsolationForest(
                100,
                Math.min(
                    256,
                    trainingFeatures.length
                )
            );

        isolationForest.fit(
            trainingFeatures
        );

        /*
         * The library's score function
         * is applied to the complete dataset
         * after fitting on training data.
         *
         * We take only the test portion.
         */
          const lastTrainingDate =
    new Date(
        train[
            train.length - 1
        ].date
    );

const testFeatures =
    buildFeatures(
        test,
        trainingMean,
        trainingStd,
        lastTrainingDate
    );

const testScores =
    isolationForest.predict(
        testFeatures
    );

        const isolationPredictions =
            testScores.map(
                score =>
                    Number(score) >=
                    LOCKED_THRESHOLD
                        ? 1
                        : 0
            );

        /*
         * ==========================================
         * 6. HYBRID
         *
         * Z-Score AND locked IF threshold.
         * ==========================================
         */

        const hybridPredictions =
            test.map(
                (_, index) =>
                    zScorePredictions[index] === 1 &&
                    isolationPredictions[index] === 1
                        ? 1
                        : 0
            );

        /*
         * ==========================================
         * 7. Final metrics
         * ==========================================
         */

        const zScoreMetrics =
            calculateMetrics(
                testActual,
                zScorePredictions
            );

        const isolationMetrics =
            calculateMetrics(
                testActual,
                isolationPredictions
            );

        const hybridMetrics =
            calculateMetrics(
                testActual,
                hybridPredictions
            );

        /*
         * ==========================================
         * 8. Detailed test predictions
         * ==========================================
         */

        const predictions =
            test.map(
                (transaction, index) => {

                    const amount =
                        Number(
                            transaction.amount
                        );

                    const zScore =
                        trainingStd > 0
                            ? (
                                amount -
                                trainingMean
                            ) /
                            trainingStd
                            : 0;

                    return {
                        transactionId:
                            transaction.transactionId,

                        date:
                            transaction.date,

                        amount:
                            transaction.amount,

                        category:
                            transaction.category,

                        actualAnomaly:
                            testActual[index],

                        zScore:
                            Number(
                                zScore.toFixed(4)
                            ),

                        zScorePrediction:
                            zScorePredictions[index],

                        isolationScore:
                            Number(
                                testScores[index]
                                    .toFixed(4)
                            ),

                        isolationPrediction:
                            isolationPredictions[index],

                        hybridPrediction:
                            hybridPredictions[index]
                    };
                }
            );

        /*
         * ==========================================
         * 9. Return final experiment
         * ==========================================
         */

        return {
            experiment: {
                name:
                    "ExpenseMind Final Anomaly Detection Experiment",

                dataset:
                    "ExpenseMind Research Dataset",

                totalExpenseTransactions:
                    transactions.length,

                trainTransactions:
                    train.length,

                validationTransactions:
                    validation.length,

                testTransactions:
                    test.length,

                testGroundTruthAnomalies:
                    testAnomalyCount,

                zScoreThreshold:
                    Z_SCORE_THRESHOLD,

                lockedIsolationForestThreshold:
                    LOCKED_THRESHOLD,

                thresholdSelection:
                    "Validation-only F1 maximization",

                testProtocol:
                    "Untouched chronological test set"
            },

            trainingStatistics: {
                mean:
                    Number(
                        trainingMean.toFixed(2)
                    ),

                standardDeviation:
                    Number(
                        trainingStd.toFixed(2)
                    )
            },

            results: {
                zScore:
                    zScoreMetrics,

                isolationForest:
                    isolationMetrics,

                hybrid:
                    hybridMetrics
            },

            testPredictions:
                predictions
        };
    };