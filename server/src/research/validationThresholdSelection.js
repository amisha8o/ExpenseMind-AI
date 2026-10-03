import ResearchTransaction
    from "../models/ResearchTransaction.js";

import {
    IsolationForest
} from "isolation-forest";

const CANDIDATE_THRESHOLDS = [
    0.50,
    0.55,
    0.60,
    0.65,
    0.70,
    0.75,
    0.80
];

const TRAINING_SIZE = 140;
const VALIDATION_SIZE = 30;
const TEST_SIZE = 30;

function calculateMean(values) {
    if (!values.length) return 0;

    return (
        values.reduce(
            (sum, value) => sum + value,
            0
        ) / values.length
    );
}

function calculateStdDev(values, mean) {
    if (values.length <= 1) return 0;

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

    for (let i = 0; i < actual.length; i++) {

        if (
            actual[i] === 1 &&
            predicted[i] === 1
        ) {
            TP++;
        }

        else if (
            actual[i] === 0 &&
            predicted[i] === 0
        ) {
            TN++;
        }

        else if (
            actual[i] === 0 &&
            predicted[i] === 1
        ) {
            FP++;
        }

        else if (
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
            )
    };
}

function buildFeatures(
    transactions,
    trainingMean,
    trainingStdDev
) {
    let previousDate = null;

    return transactions.map(
        transaction => {

            const date =
                new Date(
                    transaction.date
                );

            const amount =
                Number(
                    transaction.amount
                );

            /*
             * IMPORTANT:
             *
             * Mean and standard deviation
             * come ONLY from training data.
             */
            const zScore =
                trainingStdDev > 0
                    ? (
                        amount -
                        trainingMean
                    ) /
                    trainingStdDev
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

            previousDate = date;

            return [
                amount,
                zScore,
                dayOfWeek,
                dayOfMonth,
                daysSincePrevious
            ];
        }
    );
}

function selectBestThreshold(
    thresholdResults
) {
    /*
     * Primary:
     * Maximum F1
     *
     * Tie:
     * Minimum FPR
     *
     * Final tie:
     * Maximum Recall
     */

    return [...thresholdResults].sort(
        (a, b) => {

            if (
                b.metrics.f1Score !==
                a.metrics.f1Score
            ) {
                return (
                    b.metrics.f1Score -
                    a.metrics.f1Score
                );
            }

            if (
                a.metrics.falsePositiveRate !==
                b.metrics.falsePositiveRate
            ) {
                return (
                    a.metrics.falsePositiveRate -
                    b.metrics.falsePositiveRate
                );
            }

            return (
                b.metrics.recall -
                a.metrics.recall
            );
        }
    )[0];
}

export const selectValidationThreshold =
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

        const expectedSize =
            TRAINING_SIZE +
            VALIDATION_SIZE +
            TEST_SIZE;

        if (
            transactions.length !==
            expectedSize
        ) {
            throw new Error(
                `Research dataset must contain exactly ${expectedSize} expense transactions. Found ${transactions.length}.`
            );
        }

        /*
         * ======================================
         * CHRONOLOGICAL SPLIT
         * ======================================
         */

        const trainingData =
            transactions.slice(
                0,
                TRAINING_SIZE
            );

        const validationData =
            transactions.slice(
                TRAINING_SIZE,
                TRAINING_SIZE +
                VALIDATION_SIZE
            );

        const testData =
            transactions.slice(
                TRAINING_SIZE +
                VALIDATION_SIZE,
                expectedSize
            );

        /*
         * ======================================
         * TRAINING STATISTICS ONLY
         * ======================================
         */

        const trainingAmounts =
            trainingData.map(
                transaction =>
                    Number(
                        transaction.amount
                    )
            );

        const trainingMean =
            calculateMean(
                trainingAmounts
            );

        const trainingStdDev =
            calculateStdDev(
                trainingAmounts,
                trainingMean
            );

        /*
         * ======================================
         * FEATURES
         * ======================================
         */

        const trainingFeatures =
            buildFeatures(
                trainingData,
                trainingMean,
                trainingStdDev
            );

        const validationFeatures =
            buildFeatures(
                validationData,
                trainingMean,
                trainingStdDev
            );

        /*
         * ======================================
         * FIT ONLY ON TRAINING DATA
         * ======================================
         */

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
         * ======================================
         * SCORE UNSEEN VALIDATION DATA
         * ======================================
         *
         * predict() is specifically used here.
         *
         * Test data has NOT been passed to
         * the model.
         */

        const validationScores =
            isolationForest.predict(
                validationFeatures
            );

        /*
         * ======================================
         * VALIDATION GROUND TRUTH
         * ======================================
         */

        const validationLabels =
            validationData.map(
                transaction =>
                    Number(
                        transaction.actualAnomaly
                    )
            );

        /*
         * ======================================
         * THRESHOLD SEARCH
         * ======================================
         */

        const thresholdResults =
            CANDIDATE_THRESHOLDS.map(
                threshold => {

                    const predictions =
                        validationScores.map(
                            score =>
                                Number(score) >=
                                threshold
                                    ? 1
                                    : 0
                        );

                    return {
                        threshold,

                        detected:
                            predictions.filter(
                                value =>
                                    value === 1
                            ).length,

                        metrics:
                            calculateMetrics(
                                validationLabels,
                                predictions
                            )
                    };
                }
            );

        /*
         * ======================================
         * SELECT BEST THRESHOLD
         * ======================================
         */

        const selected =
            selectBestThreshold(
                thresholdResults
            );

        /*
         * ======================================
         * TEST DATA IS ONLY COUNTED HERE
         * ======================================
         *
         * We report its size and labels
         * for protocol transparency.
         *
         * NO test features are created.
         * NO test scores are generated.
         * NO test labels are used for
         * threshold selection.
         */

        const testAnomalies =
            testData.filter(
                transaction =>
                    Number(
                        transaction.actualAnomaly
                    ) === 1
            ).length;

        return {

            protocol: {

                trainingTransactions:
                    trainingData.length,

                validationTransactions:
                    validationData.length,

                testTransactions:
                    testData.length,

                split:
                    "140 / 30 / 30 chronological",

                testIsolation:
                    "Test observations were not passed to the model during threshold selection.",

                selectionCriterion:
                    "Maximum validation F1; tie-break by minimum validation FPR; final tie-break by maximum validation recall."
            },

            trainingStatistics: {

                mean:
                    Number(
                        trainingMean.toFixed(2)
                    ),

                standardDeviation:
                    Number(
                        trainingStdDev.toFixed(2)
                    )
            },

            validationGroundTruth: {

                normal:
                    validationLabels.filter(
                        value => value === 0
                    ).length,

                anomalies:
                    validationLabels.filter(
                        value => value === 1
                    ).length
            },

            testAudit: {

                transactionCount:
                    testData.length,

                groundTruthAnomalies:
                    testAnomalies
            },

            thresholdResults,

            selectedThreshold: {

                value:
                    selected.threshold,

                validationMetrics:
                    selected.metrics
            }
        };
    };