import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resultsPath = path.join(
    __dirname,
    "results",
    "FINAL_RESEARCH_RESULTS.json"
);

const outputDir = path.join(
    __dirname,
    "results",
    "tables"
);

if (!fs.existsSync(resultsPath)) {
    throw new Error(
        "FINAL_RESEARCH_RESULTS.json not found."
    );
}

const results = JSON.parse(
    fs.readFileSync(resultsPath, "utf8")
);

fs.mkdirSync(outputDir, {
    recursive: true
});

/* =====================================================
   TABLE I — DATASET SUMMARY
===================================================== */

const dataset = results.dataset;

const table1 = `
TABLE I
RESEARCH DATASET SUMMARY

| Parameter | Value |
|---|---:|
| Dataset Type | ${dataset.type} |
| Duration | ${dataset.durationDays} days |
| Total Transactions | ${dataset.totalTransactions} |
| Expense Transactions | ${dataset.totalExpenseTransactions} |
| Income Transactions | ${dataset.totalIncomeTransactions} |
| Normal Expenses | ${dataset.normalExpenses} |
| Known Anomalies | ${dataset.knownAnomalies} |
| Random Seed | ${dataset.randomSeed} |
`;

/* =====================================================
   TABLE II — ANOMALY DETECTION PERFORMANCE
===================================================== */

const anomalyModels = [
    ["Z-Score", results.anomalyDetection.zScore],
    [
        "Isolation Forest",
        results.anomalyDetection.isolationForest
    ],
    ["Hybrid", results.anomalyDetection.hybrid]
];

const table2Rows = anomalyModels
    .map(([model, data]) => `
| ${model} | ${data.TP} | ${data.TN} | ${data.FP} | ${data.FN} | ${(data.precision * 100).toFixed(2)}% | ${(data.recall * 100).toFixed(2)}% | ${(data.f1Score * 100).toFixed(2)}% | ${(data.accuracy * 100).toFixed(2)}% | ${(data.falsePositiveRate * 100).toFixed(2)}% |
`)
    .join("");

const table2 = `
TABLE II
ANOMALY DETECTION PERFORMANCE

| Model | TP | TN | FP | FN | Precision | Recall | F1 | Accuracy | FPR |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
${table2Rows}
`;

/* =====================================================
   TABLE III — THRESHOLD SENSITIVITY
===================================================== */

const table3Rows = results.thresholdSensitivity
    .map((item) => `
| ${item.threshold.toFixed(2)} | ${(item.precision * 100).toFixed(2)}% | ${(item.recall * 100).toFixed(2)}% | ${(item.f1Score * 100).toFixed(2)}% | ${(item.falsePositiveRate * 100).toFixed(2)}% | ${(item.accuracy * 100).toFixed(2)}% |
`)
    .join("");

const table3 = `
TABLE III
ISOLATION FOREST THRESHOLD SENSITIVITY ANALYSIS

| Threshold | Precision | Recall | F1 | FPR | Accuracy |
|---:|---:|---:|---:|---:|---:|
${table3Rows}
`;

/* =====================================================
   TABLE IV — FORECASTING PERFORMANCE
===================================================== */

const raw = results.forecasting.rawForecast;
const aware = results.forecasting.anomalyAwareForecast;

const table4 = `
TABLE IV
FORECASTING PERFORMANCE

| Model | MAE | RMSE |
|---|---:|---:|
| ${raw.model} | ₹${raw.MAE.toFixed(2)} | ₹${raw.RMSE.toFixed(2)} |
| ${aware.model} | ₹${aware.MAE.toFixed(2)} | ₹${aware.RMSE.toFixed(2)} |
`;

/* =====================================================
   TABLE V — FORECASTING IMPROVEMENT
===================================================== */

const improvement =
    results.forecasting.improvement;

const table5 = `
TABLE V
FORECASTING IMPROVEMENT

| Metric | Raw Linear Trend | Anomaly-Aware | Improvement |
|---|---:|---:|---:|
| MAE | ₹${raw.MAE.toFixed(2)} | ₹${aware.MAE.toFixed(2)} | ${improvement.MAEImprovementPercentage.toFixed(2)}% |
| RMSE | ₹${raw.RMSE.toFixed(2)} | ₹${aware.RMSE.toFixed(2)} | ${improvement.RMSEImprovementPercentage.toFixed(2)}% |
`;

/* =====================================================
   RESEARCH EXPERIMENT SETUP
===================================================== */

const setup = results.experimentSetup;
const processing = results.anomalyProcessing;

const table6 = `
TABLE VI
EXPERIMENT CONFIGURATION

| Parameter | Value |
|---|---|
| Dataset | ${setup.dataset} |
| Total Expense Transactions | ${setup.totalExpenseTransactions} |
| Observation Days | ${setup.observationDays} |
| Training Days | ${setup.trainDays} |
| Testing Days | ${setup.testDays} |
| Train/Test Split | ${setup.trainTestSplit} |
| Test Data Used for Training | ${setup.testDataUsedForTraining ? "Yes" : "No"} |
| Anomaly Detection Method | ${processing.method} |
| Z-Score Threshold | ${processing.zScoreThreshold} |
| Isolation Forest Threshold | ${processing.isolationForestThreshold} |
| Training Anomalies Removed | ${processing.trainingAnomaliesRemoved} |
| Test Anomalies Used for Training | ${processing.testAnomaliesUsedForTraining ? "Yes" : "No"} |
`;

/* =====================================================
   COMPLETE TABLE DOCUMENT
===================================================== */

const completeTables = `
# ExpenseMind AI — Research Tables

Source:
FINAL_RESEARCH_RESULTS.json

Results Status:
${results.resultsStatus}

Invented Values:
${results.inventedValues}

${table1}

${table2}

${table3}

${table4}

${table5}

${table6}
`;

const outputPath = path.join(
    outputDir,
    "RESEARCH_TABLES.md"
);

fs.writeFileSync(
    outputPath,
    completeTables.trim(),
    "utf8"
);

/* =====================================================
   CSV EXPORTS
===================================================== */

const anomalyCsv = [
    "Model,TP,TN,FP,FN,Precision,Recall,F1,Accuracy,FPR",
    ...anomalyModels.map(([model, data]) =>
        [
            model,
            data.TP,
            data.TN,
            data.FP,
            data.FN,
            data.precision,
            data.recall,
            data.f1Score,
            data.accuracy,
            data.falsePositiveRate
        ].join(",")
    )
].join("\n");

fs.writeFileSync(
    path.join(
        outputDir,
        "TABLE_II_Anomaly_Performance.csv"
    ),
    anomalyCsv,
    "utf8"
);

const thresholdCsv = [
    "Threshold,Precision,Recall,F1,FPR,Accuracy",
    ...results.thresholdSensitivity.map((item) =>
        [
            item.threshold,
            item.precision,
            item.recall,
            item.f1Score,
            item.falsePositiveRate,
            item.accuracy
        ].join(",")
    )
].join("\n");

fs.writeFileSync(
    path.join(
        outputDir,
        "TABLE_III_Threshold_Sensitivity.csv"
    ),
    thresholdCsv,
    "utf8"
);

const forecastingCsv = [
    "Model,MAE,RMSE",
    `${raw.model},${raw.MAE},${raw.RMSE}`,
    `${aware.model},${aware.MAE},${aware.RMSE}`
].join("\n");

fs.writeFileSync(
    path.join(
        outputDir,
        "TABLE_IV_Forecasting_Performance.csv"
    ),
    forecastingCsv,
    "utf8"
);

const improvementCsv = [
    "Metric,Raw Linear Trend,Anomaly-Aware,Improvement Percentage",
    `MAE,${raw.MAE},${aware.MAE},${improvement.MAEImprovementPercentage}`,
    `RMSE,${raw.RMSE},${aware.RMSE},${improvement.RMSEImprovementPercentage}`
].join("\n");

fs.writeFileSync(
    path.join(
        outputDir,
        "TABLE_V_Forecasting_Improvement.csv"
    ),
    improvementCsv,
    "utf8"
);

console.log("");
console.log("==============================================");
console.log("RESEARCH TABLE GENERATION COMPLETE");
console.log("==============================================");
console.log("");
console.log("Source:");
console.log("FINAL_RESEARCH_RESULTS.json");
console.log("");
console.log("Generated:");
console.log("TABLE I  - Dataset Summary");
console.log("TABLE II - Anomaly Detection Performance");
console.log("TABLE III - Threshold Sensitivity");
console.log("TABLE IV - Forecasting Performance");
console.log("TABLE V - Forecasting Improvement");
console.log("TABLE VI - Experiment Configuration");
console.log("");
console.log("Output directory:");
console.log(outputDir);
console.log("");
console.log("==============================================");