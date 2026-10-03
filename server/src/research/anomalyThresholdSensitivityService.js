import ResearchTransaction
    from "../models/ResearchTransaction.js";

import {
    IsolationForest
} from "isolation-forest";

const THRESHOLDS = [
    0.50,
    0.55,
    0.60,
    0.65,
    0.70,
    0.75,
    0.80
];

const FOREST_TREES = 100;

function calculateMean(values) {
    if (!values.length) return 0;

    return values.reduce(
        (sum, value) => sum + value,
        0
    ) / values.length;
}

function calculateStd(values) {
    if (values.length <= 1) return 0;

    const mean =
        calculateMean(values);

    const variance =
        values.reduce(
            (sum, value) =>
                sum +
                Math.pow(value - mean, 2),
            0
        ) / values.length;

    return Math.sqrt(variance);
}

function calculateZScores(transactions) {

    const amounts =
        transactions.map(
            transaction =>
                Number(transaction.amount)
        );

    const mean =
        calculateMean(amounts);

    const std =
        calculateStd(amounts);

    return transactions.map(
        transaction => {

            const amount =
                Number(transaction.amount);

            if (std === 0) {
                return 0;
            }

            return (
                amount - mean
            ) / std;
        }
    );
}

function daysBetween(
    currentDate,
    previousDate
) {
    if (!previousDate) {
        return 0;
    }

    return (
        new Date(currentDate).getTime() -
        new Date(previousDate).getTime()
    ) /
    (1000 * 60 * 60 * 24);
}

function buildFeatures(
    transactions,
    zScores
) {
    const features = [];

    let previousDate = null;

    for (
        let index = 0;
        index < transactions.length;
        index++
    ) {

        const transaction =
            transactions[index];

        const currentDate =
            new Date(transaction.date);

        features.push([
            Number(transaction.amount),

            Number(zScores[index]),

            currentDate.getUTCDay(),

            currentDate.getUTCDate(),

            daysBetween(
                currentDate,
                previousDate
            )
        ]);

        previousDate =
            currentDate;
    }

    return features;
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
        let index = 0;
        index < actual.length;
        index++
    ) {

        if (
            actual[index] === 1 &&
            predicted[index] === 1
        ) {
            TP++;
        }

        else if (
            actual[index] === 0 &&
            predicted[index] === 0
        ) {
            TN++;
        }

        else if (
            actual[index] === 0 &&
            predicted[index] === 1
        ) {
            FP++;
        }

        else if (
            actual[index] === 1 &&
            predicted[index] === 0
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

    const f1Score =
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
                f1Score.toFixed(4)
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

export const evaluateIsolationForestThresholds =
    async () => {

        /*
         * ======================================
         * 1. Load research expense dataset
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

        if (transactions.length < 20) {
            throw new Error(
                "At least 20 research expense transactions are required."
            );
        }

        /*
         * ======================================
         * 2. Ground truth
         * ======================================
         */

        const actualLabels =
            transactions.map(
                transaction =>
                    Number(
                        transaction.actualAnomaly
                    )
            );

        /*
         * ======================================
         * 3. Feature preparation
         * ======================================
         */

        const zScores =
            calculateZScores(
                transactions
            );

        const features =
            buildFeatures(
                transactions,
                zScores
            );

        /*
         * ======================================
         * 4. Isolation Forest
         * ======================================
         */

        const isolationForest =
            new IsolationForest(
                FOREST_TREES,
                Math.min(
                    256,
                    features.length
                )
            );

        isolationForest.fit(
            features
        );

        const scores =
            isolationForest.scores();

        /*
         * ======================================
         * 5. Evaluate every threshold
         * ======================================
         */

        const results =
            THRESHOLDS.map(
                threshold => {

                    const predictions =
                        scores.map(
                            score =>
                                Number(score) >=
                                threshold
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

                        detectedAnomalies:
                            predictions.filter(
                                value => value === 1
                            ).length,

                        ...metrics
                    };
                }
            );

        /*
         * ======================================
         * 6. Score distribution
         * ======================================
         */

        const sortedScores =
            [...scores].sort(
                (a, b) => a - b
            );

        return {

            success: true,

            experiment: {
                name:
                    "Isolation Forest Threshold Sensitivity Analysis",

                dataset:
                    "ExpenseMind Research Dataset",

                transactionCount:
                    transactions.length,

                groundTruthAnomalies:
                    actualLabels.filter(
                        value => value === 1
                    ).length,

                forestTrees:
                    FOREST_TREES,

                testedThresholds:
                    THRESHOLDS
            },

            scoreStatistics: {

                minimum:
                    Number(
                        Math.min(
                            ...scores
                        ).toFixed(4)
                    ),

                maximum:
                    Number(
                        Math.max(
                            ...scores
                        ).toFixed(4)
                    ),

                mean:
                    Number(
                        calculateMean(
                            scores
                        ).toFixed(4)
                    ),

                median:
                    Number(
                        sortedScores[
                            Math.floor(
                                sortedScores.length /
                                2
                            )
                        ].toFixed(4)
                    )
            },

            results
        };
    };