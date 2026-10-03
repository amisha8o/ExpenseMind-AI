import ResearchTransaction
    from "../models/ResearchTransaction.js";

import {
    IsolationForest
} from "isolation-forest";

const Z_SCORE_THRESHOLD = 2.5;
const ISOLATION_THRESHOLD = 0.65;

function calculateMean(values) {
    if (!values.length) return 0;

    return (
        values.reduce(
            (sum, value) => sum + value,
            0
        ) / values.length
    );
}

function calculateStandardDeviation(values, mean) {
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
        const actualValue = actual[i];
        const predictedValue = predicted[i];

        if (
            actualValue === 1 &&
            predictedValue === 1
        ) {
            TP++;
        } else if (
            actualValue === 0 &&
            predictedValue === 0
        ) {
            TN++;
        } else if (
            actualValue === 0 &&
            predictedValue === 1
        ) {
            FP++;
        } else if (
            actualValue === 1 &&
            predictedValue === 0
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
            ? (TP + TN) / actual.length
            : 0;

    return {
        TP,
        TN,
        FP,
        FN,

        precision: Number(
            precision.toFixed(4)
        ),

        recall: Number(
            recall.toFixed(4)
        ),

        f1Score: Number(
            f1.toFixed(4)
        ),

        falsePositiveRate: Number(
            falsePositiveRate.toFixed(4)
        ),

        accuracy: Number(
            accuracy.toFixed(4)
        )
    };
}

function evaluateThresholds(
    actualLabels,
    isolationScores,
    thresholds
) {
    return thresholds.map(threshold => {

        const predictions =
            isolationScores.map(
                score =>
                    Number(score) >= threshold
                        ? 1
                        : 0
            );

        const metrics =
            calculateMetrics(
                actualLabels,
                predictions
            );

        return {
            threshold,

            TP: metrics.TP,
            TN: metrics.TN,
            FP: metrics.FP,
            FN: metrics.FN,

            precision:
                metrics.precision,

            recall:
                metrics.recall,

            f1Score:
                metrics.f1Score,

            falsePositiveRate:
                metrics.falsePositiveRate
        };
    });
}

function buildFeatureVector(
    transaction,
    zScore,
    previousDate
) {
    const currentDate =
        new Date(transaction.date);

    const dayOfWeek =
        currentDate.getUTCDay();

    const dayOfMonth =
        currentDate.getUTCDate();

    let daysSincePrevious = 0;

    if (previousDate) {
        const difference =
            currentDate.getTime() -
            previousDate.getTime();

        daysSincePrevious =
            difference /
            (1000 * 60 * 60 * 24);
    }

    return [
        Number(transaction.amount),
        Number(zScore),
        Number(dayOfWeek),
        Number(dayOfMonth),
        Number(daysSincePrevious)
    ];
}

export const evaluateAnomalyDetection =
    async () => {

        const transactions =
            await ResearchTransaction
                .find({
                    type: "expense"
                })
                .sort({
                    date: 1
                })
                .lean();

        if (transactions.length < 10) {
            throw new Error(
                "Research dataset must contain at least 10 expense transactions."
            );
        }

        /*
         * ==========================================
         * 1. Ground truth
         * ==========================================
         */

        const amounts =
            transactions.map(
                transaction =>
                    Number(transaction.amount)
            );

        const mean =
            calculateMean(amounts);

        const standardDeviation =
            calculateStandardDeviation(
                amounts,
                mean
            );

        /*
         * ==========================================
         * 2. Z-SCORE DETECTOR
         * ==========================================
         */

        const zScores =
            transactions.map(
                transaction => {

                    const amount =
                        Number(
                            transaction.amount
                        );

                    if (
                        standardDeviation === 0
                    ) {
                        return 0;
                    }

                    return (
                        amount - mean
                    ) /
                    standardDeviation;
                }
            );

        const zScorePredictions =
            zScores.map(
                zScore =>
                    Math.abs(zScore) >=
                    Z_SCORE_THRESHOLD
                        ? 1
                        : 0
            );

        /*
         * ==========================================
         * 3. ISOLATION FOREST
         * ==========================================
         */

        const features = [];

        let previousDate = null;

        for (
            let i = 0;
            i < transactions.length;
            i++
        ) {
            const transaction =
                transactions[i];

            features.push(
                buildFeatureVector(
                    transaction,
                    zScores[i],
                    previousDate
                )
            );

            previousDate =
                new Date(transaction.date);
        }

        const isolationForest =
            new IsolationForest(
                100,
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

        const isolationPredictions =
            isolationScores.map(
                score =>
                    Number(score) >=
                    ISOLATION_THRESHOLD
                        ? 1
                        : 0
            );

        /*
         * ==========================================
         * 4. HYBRID DETECTOR
         * ==========================================
         *
         * Both detectors must agree.
         */

        const hybridPredictions =
            transactions.map(
                (_, index) =>
                    zScorePredictions[index] === 1 &&
                    isolationPredictions[index] === 1
                        ? 1
                        : 0
            );

        /*
         * ==========================================
         * 5. ACTUAL GROUND TRUTH
         * ==========================================
         */

        const actualLabels =
            transactions.map(
                transaction =>
                    Number(
                        transaction.actualAnomaly
                    )
            );

        /*
         * ==========================================
         * 6. METRICS
         * ==========================================
         */

        const zScoreMetrics =
            calculateMetrics(
                actualLabels,
                zScorePredictions
            );

        const isolationMetrics =
            calculateMetrics(
                actualLabels,
                isolationPredictions
            );

        const hybridMetrics =
            calculateMetrics(
                actualLabels,
                hybridPredictions
            );

        /*
         * ==========================================
         * 7. Detailed predictions
         * ==========================================
         */

        const predictionDetails =
            transactions.map(
                (transaction, index) => ({
                    transactionId:
                        transaction.transactionId,

                    date:
                        transaction.date,

                    amount:
                        transaction.amount,

                    category:
                        transaction.category,

                    actualAnomaly:
                        actualLabels[index],

                    zScore:
                        Number(
                            zScores[index]
                                .toFixed(4)
                        ),

                    zScorePrediction:
                        zScorePredictions[index],

                    isolationScore:
                        Number(
                            isolationScores[index]
                                .toFixed(4)
                        ),

                    isolationPrediction:
                        isolationPredictions[index],

                    hybridPrediction:
                        hybridPredictions[index]
                })
            );

        return {
            success: true,

            experiment: {
                name:
                    "ExpenseMind Anomaly Detection Experiment",

                version: "1.0",

                dataset:
                    "ExpenseMind Research Dataset",

                transactionCount:
                    transactions.length,

                groundTruthAnomalies:
                    actualLabels.filter(
                        value => value === 1
                    ).length,

                zScoreThreshold:
                    Z_SCORE_THRESHOLD,

                isolationForestThreshold:
                    ISOLATION_THRESHOLD
            },

            statistics: {
                meanExpense:
                    Number(
                        mean.toFixed(2)
                    ),

                standardDeviation:
                    Number(
                        standardDeviation.toFixed(2)
                    )
            },

           results: {
    zScore: zScoreMetrics,

    isolationForest:
        isolationMetrics,

    hybrid:
        hybridMetrics
},

thresholdSensitivity:
    evaluateThresholds(
        actualLabels,
        isolationScores,
        [
            0.50,
            0.55,
            0.60,
            0.65,
            0.70,
            0.75,
            0.80
        ]
    ),

            predictions:
                predictionDetails
        };
    };