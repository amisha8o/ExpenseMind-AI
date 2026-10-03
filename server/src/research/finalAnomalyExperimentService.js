import ResearchTransaction
    from "../models/ResearchTransaction.js";

import {
    IsolationForest
} from "isolation-forest";

const SEED = 20260926;

const ISOLATION_THRESHOLDS = [
    0.50,
    0.55,
    0.60,
    0.65,
    0.70,
    0.75,
    0.80
];

const TRAIN_RATIO = 0.70;
const VALIDATION_RATIO = 0.15;

const ISOLATION_TREES = 100;

const Z_SCORE_THRESHOLD = 2.5;


// ==========================================
// Reproducible pseudo-random generator
// ==========================================

function createRandom(seed) {

    let value = seed;

    return function random() {

        value =
            (value * 1664525 + 1013904223)
            % 4294967296;

        return value / 4294967296;
    };
}


// ==========================================
// Statistics
// ==========================================

function calculateMean(values) {

    if (!values.length) {
        return 0;
    }

    return (
        values.reduce(
            (sum, value) =>
                sum + value,
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
                Math.pow(
                    value - mean,
                    2
                ),
            0
        ) / values.length;

    return Math.sqrt(variance);
}


// ==========================================
// Classification metrics
// ==========================================

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

    const f1Score =
        precision + recall > 0
            ? (
                2 *
                precision *
                recall
            ) /
            (
                precision +
                recall
            )
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


// ==========================================
// Feature engineering
// ==========================================

function buildFeatures(
    transactions,
    mean,
    standardDeviation
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

            previousDate = date;

            return {

                transaction,

                zScore,

                features: [

                    amount,

                    zScore,

                    dayOfWeek,

                    dayOfMonth,

                    daysSincePrevious
                ]
            };
        }
    );
}


// ==========================================
// Deterministic dataset split
// ==========================================

function deterministicSplit(
    transactions
) {

    const random =
        createRandom(SEED);

    const shuffled =
        [...transactions];

    for (
        let i =
            shuffled.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                random() *
                (i + 1)
            );

        [
            shuffled[i],
            shuffled[j]
        ] =
        [
            shuffled[j],
            shuffled[i]
        ];
    }

    const trainEnd =
        Math.floor(
            shuffled.length *
            TRAIN_RATIO
        );

    const validationEnd =
        trainEnd +
        Math.floor(
            shuffled.length *
            VALIDATION_RATIO
        );

    return {

        training:
            shuffled.slice(
                0,
                trainEnd
            ),

        validation:
            shuffled.slice(
                trainEnd,
                validationEnd
            ),

        test:
            shuffled.slice(
                validationEnd
            )
    };
}


// ==========================================
// Train Isolation Forest
// ==========================================

function trainIsolationForest(
    trainingFeatures
) {

    const isolationForest =
        new IsolationForest(
            ISOLATION_TREES,
            Math.min(
                256,
                trainingFeatures.length
            )
        );

    const originalRandom =
        Math.random;

    Math.random =
        createRandom(SEED);

    try {

        isolationForest.fit(
            trainingFeatures
        );

    } finally {

        Math.random =
            originalRandom;
    }

    return isolationForest;
}


// ==========================================
// Threshold sensitivity
// ==========================================

function evaluateThresholds(
    actualLabels,
    scores
) {

    return ISOLATION_THRESHOLDS.map(
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
        }
    );
}


// ==========================================
// Select threshold from VALIDATION only
// ==========================================

function selectThreshold(
    actualLabels,
    scores
) {

    const sensitivity =
        evaluateThresholds(
            actualLabels,
            scores
        );

    let selectedThreshold =
        ISOLATION_THRESHOLDS[0];

    let bestF1 = -1;

    for (
        const result
        of sensitivity
    ) {

        if (
            result.f1Score >
            bestF1
        ) {

            bestF1 =
                result.f1Score;

            selectedThreshold =
                result.threshold;
        }
    }

    return {

        selectedThreshold,

        sensitivity
    };
}


// ==========================================
// FINAL EXPERIMENT
// ==========================================

export const runFinalAnomalyExperiment =
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


        if (
            transactions.length < 30
        ) {

            throw new Error(
                "At least 30 research expense transactions are required."
            );
        }


        // ======================================
        // Split dataset
        // ======================================

        const {
            training,
            validation,
            test
        } =
            deterministicSplit(
                transactions
            );


        // ======================================
        // Training statistics ONLY
        // ======================================

        const trainingAmounts =
            training.map(
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


        // ======================================
        // Feature engineering
        // ======================================

        const allFeatureObjects =
            buildFeatures(
                transactions,
                trainingMean,
                trainingStd
            );


        const featureMap =
            new Map(
                allFeatureObjects.map(
                    item => [

                        item.transaction
                            .transactionId,

                        item
                    ]
                )
            );


        const trainingFeatures =
            training.map(
                transaction =>
                    featureMap.get(
                        transaction
                            .transactionId
                    ).features
            );


        const validationFeatures =
            validation.map(
                transaction =>
                    featureMap.get(
                        transaction
                            .transactionId
                    ).features
            );


        const testFeatures =
            test.map(
                transaction =>
                    featureMap.get(
                        transaction
                            .transactionId
                    ).features
            );


        // ======================================
        // Train ONLY on training set
        // ======================================

        const isolationForest =
            trainIsolationForest(
                trainingFeatures
            );


        // ======================================
        // Validation scores
        // ======================================

        const validationScores =
            isolationForest.predict(
                validationFeatures
            );


        const validationActual =
            validation.map(
                transaction =>
                    Number(
                        transaction.actualAnomaly
                    )
            );


        // ======================================
        // Threshold selection
        // ======================================

        const thresholdResult =
            selectThreshold(
                validationActual,
                validationScores
            );


        const selectedThreshold =
            thresholdResult
                .selectedThreshold;


        // ======================================
        // TEST — untouched until now
        // ======================================

        const testScores =
            isolationForest.predict(
                testFeatures
            );


        const testActual =
            test.map(
                transaction =>
                    Number(
                        transaction.actualAnomaly
                    )
            );


        // ======================================
        // Z-SCORE TEST PREDICTIONS
        // ======================================

        const testZScores =
            test.map(
                transaction => {

                    const amount =
                        Number(
                            transaction.amount
                        );

                    return trainingStd > 0
                        ? (
                            amount -
                            trainingMean
                        ) /
                        trainingStd
                        : 0;
                }
            );


        const testZPredictions =
            testZScores.map(
                score =>
                    Math.abs(score) >=
                    Z_SCORE_THRESHOLD
                        ? 1
                        : 0
            );


        // ======================================
        // Isolation Forest predictions
        // ======================================

        const isolationPredictions =
            testScores.map(
                score =>
                    Number(score) >=
                    selectedThreshold
                        ? 1
                        : 0
            );


        // ======================================
        // Hybrid predictions
        // ======================================

        const hybridPredictions =
            test.map(
                (_, index) =>

                    testZPredictions[index] === 1 &&
                    isolationPredictions[index] === 1

                        ? 1
                        : 0
            );


        // ======================================
        // FINAL METRICS
        // ======================================

        const zScoreMetrics =
            calculateMetrics(
                testActual,
                testZPredictions
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


        // ======================================
        // Detailed predictions
        // ======================================

        const predictions =
            test.map(
                (transaction, index) => ({

                    transactionId:
                        transaction
                            .transactionId,

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
                            testZScores[index]
                                .toFixed(4)
                        ),

                    zScorePrediction:
                        testZPredictions[index],

                    isolationScore:
                        Number(
                            testScores[index]
                                .toFixed(4)
                        ),

                    isolationPrediction:
                        isolationPredictions[index],

                    hybridPrediction:
                        hybridPredictions[index]
                })
            );


        // ======================================
        // Return research result
        // ======================================

        return {

            experiment: {

                name:
                    "ExpenseMind Final Anomaly Detection Experiment",

                version:
                    "2.0",

                dataset:
                    "ExpenseMind Research Dataset",

                seed:
                    SEED,

                totalTransactions:
                    transactions.length,

                trainingTransactions:
                    training.length,

                validationTransactions:
                    validation.length,

                testTransactions:
                    test.length,

                isolationForestTrees:
                    ISOLATION_TREES,

                zScoreThreshold:
                    Z_SCORE_THRESHOLD,

                selectedIsolationThreshold:
                    selectedThreshold
            },


            statistics: {

                trainingMean:
                    Number(
                        trainingMean.toFixed(2)
                    ),

                trainingStandardDeviation:
                    Number(
                        trainingStd.toFixed(2)
                    )
            },


            validation: {

                thresholdSensitivity:
                    thresholdResult
                        .sensitivity,

                selectedThreshold
            },


            finalTestResults: {

                zScore:
                    zScoreMetrics,

                isolationForest:
                    isolationMetrics,

                hybrid:
                    hybridMetrics
            },


            predictions
        };
    };