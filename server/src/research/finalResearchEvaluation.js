/*
=========================================================
ExpenseMind AI
FINAL RESEARCH EVALUATION
=========================================================

Purpose:
Consolidate the final research experiment results.

Dataset:
- 90 days
- 220 transactions
- 200 expenses
- 20 income
- 190 normal expenses
- 10 known anomalies
- Seed: 20260926

This file does NOT modify application data.
It creates a reproducible research summary.
=========================================================
*/

const datasetSummary = {
    datasetType: "Controlled Synthetic Dataset",
    durationDays: 90,
    totalTransactions: 220,
    totalExpenses: 200,
    totalIncome: 20,
    normalExpenses: 190,
    knownAnomalies: 10,
    randomSeed: 20260926
};


/*
=========================================================
ANOMALY DETECTION RESULTS
=========================================================
Replace ONLY these values with the FINAL 5E results.
Do not manually improve or alter the results.
=========================================================
*/

const anomalyResults = {
    zScore: {
        model: "Z-Score",
        TP: null,
        TN: null,
        FP: null,
        FN: null,
        precision: null,
        recall: null,
        f1: null,
        falsePositiveRate: null,
        accuracy: null
    },

    isolationForest: {
        model: "Isolation Forest",
        TP: null,
        TN: null,
        FP: null,
        FN: null,
        precision: null,
        recall: null,
        f1: null,
        falsePositiveRate: null,
        accuracy: null
    },

    hybrid: {
        model: "Hybrid",
        TP: null,
        TN: null,
        FP: null,
        FN: null,
        precision: null,
        recall: null,
        f1: null,
        falsePositiveRate: null,
        accuracy: null
    }
};


/*
=========================================================
FORECASTING RESULTS
=========================================================
These values must come from the final 5G validation.
=========================================================
*/

const forecastingResults = {
    baseline: {
        model: "Mean Baseline",
        MAE: null,
        RMSE: null
    },

    linearTrend: {
        model: "Linear Trend Regression",
        MAE: null,
        RMSE: null
    },

    anomalyAware: {
        model: "Anomaly-Aware Linear Trend Regression",
        MAE: null,
        RMSE: null
    }
};


/*
=========================================================
IMPROVEMENT
=========================================================
*/

const calculateImprovement = (raw, improved) => {

    if (
        raw === null ||
        improved === null ||
        raw === 0
    ) {
        return null;
    }

    return Number(
        (((raw - improved) / raw) * 100).toFixed(2)
    );
};


const improvement = {
    MAEImprovementPercentage:
        calculateImprovement(
            forecastingResults.linearTrend.MAE,
            forecastingResults.anomalyAware.MAE
        ),

    RMSEImprovementPercentage:
        calculateImprovement(
            forecastingResults.linearTrend.RMSE,
            forecastingResults.anomalyAware.RMSE
        )
};


/*
=========================================================
VALIDATION
=========================================================
*/

const validation = {

    datasetValidation:
        datasetSummary.totalTransactions ===
        datasetSummary.totalExpenses +
        datasetSummary.totalIncome,

    anomalyGroundTruthValidation:
        datasetSummary.normalExpenses +
        datasetSummary.knownAnomalies ===
        datasetSummary.totalExpenses,

    anomalyEvaluationCompleted:
        Object.values(anomalyResults).every(
            (result) =>
                result.TP !== null &&
                result.TN !== null &&
                result.FP !== null &&
                result.FN !== null
        ),

    forecastingEvaluationCompleted:
        Object.values(forecastingResults).every(
            (result) =>
                result.MAE !== null &&
                result.RMSE !== null
        )
};


/*
=========================================================
FINAL RESEARCH REPORT
=========================================================
*/

const finalResearchEvaluation = {

    project:
        "ExpenseMind AI",

    researchTitle:
        "Explainable Intelligent Personal Finance System with Hybrid Anomaly Detection and Anomaly-Aware Expense Forecasting",

    dataset:
        datasetSummary,

    anomalyDetection:
        anomalyResults,

    forecasting:
        forecastingResults,

    improvement,

    validation,

    researchPipeline: [
        "Controlled Dataset Generation",
        "Ground Truth Construction",
        "Z-Score Anomaly Detection",
        "Isolation Forest Anomaly Detection",
        "Hybrid Anomaly Detection",
        "Threshold Sensitivity Analysis",
        "Final Anomaly Comparison",
        "Linear Trend Forecasting",
        "Forecast Validation",
        "Anomaly-Aware Forecasting",
        "Final Research Evaluation"
    ]
};


/*
=========================================================
PRINT FINAL REPORT
=========================================================
*/

console.log("\n");
console.log("=================================================");
console.log("        EXPENSEMIND AI RESEARCH EVALUATION");
console.log("=================================================");

console.log("\nDATASET");
console.log("-----------------------------------------------");
console.table(datasetSummary);

console.log("\nANOMALY DETECTION");
console.log("-----------------------------------------------");
console.table(
    Object.values(anomalyResults)
);

console.log("\nFORECASTING");
console.log("-----------------------------------------------");
console.table(
    Object.values(forecastingResults)
);

console.log("\nIMPROVEMENT");
console.log("-----------------------------------------------");
console.table(improvement);

console.log("\nVALIDATION");
console.log("-----------------------------------------------");
console.table(validation);

console.log("\nRESEARCH PIPELINE");
console.log("-----------------------------------------------");

finalResearchEvaluation.researchPipeline
    .forEach(
        (step, index) => {
            console.log(
                `${index + 1}. ${step}`
            );
        }
    );

console.log("\n=================================================");
console.log("FINAL RESEARCH EVALUATION OBJECT");
console.log("=================================================");

console.log(
    JSON.stringify(
        finalResearchEvaluation,
        null,
        2
    )
);

console.log("\n=================================================");
console.log("END OF RESEARCH EVALUATION");
console.log("=================================================\n");


export default finalResearchEvaluation;