import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";

import {
    evaluateAnomalyDetection
} from "./anomalyEvaluationService.js";

import {
    evaluateExpenseForecasting
} from "./forecastingEvaluationService.js";

dotenv.config();

const resultsDirectory = path.resolve(
    process.cwd(),
    "src",
    "research",
    "results"
);

const figuresDirectory = path.join(
    resultsDirectory,
    "figures"
);

function ensureDirectories() {
    fs.mkdirSync(
        figuresDirectory,
        {
            recursive: true
        }
    );
}

function writeJson(
    fileName,
    data
) {
    const filePath =
        path.join(
            resultsDirectory,
            fileName
        );

    fs.writeFileSync(
        filePath,
        JSON.stringify(
            data,
            null,
            2
        )
    );

    console.log(
        `Created: ${filePath}`
    );
}

function writeCsv(
    fileName,
    headers,
    rows
) {
    const filePath =
        path.join(
            resultsDirectory,
            fileName
        );

    const csv = [
        headers.join(","),
        ...rows.map(
            row =>
                row
                    .map(value =>
                        `"${String(value).replace(
                            /"/g,
                            '""'
                        )}"`
                    )
                    .join(",")
        )
    ].join("\n");

    fs.writeFileSync(
        filePath,
        csv
    );

    console.log(
        `Created: ${filePath}`
    );
}

async function exportResults() {

    try {

        ensureDirectories();

        await mongoose.connect(
            process.env.MONGO_URI
        );

        console.log(
            "\nMongoDB connected."
        );

        /*
         * ==========================================
         * 1. ANOMALY DETECTION RESULTS
         * ==========================================
         */

        console.log(
            "\nRunning anomaly detection experiment..."
        );

        const anomalyResult =
            await evaluateAnomalyDetection();

        writeJson(
            "anomalyDetectionResults.json",
            anomalyResult
        );

        const anomalyRows = [
            [
                "Z-Score",
                anomalyResult.results.zScore.TP,
                anomalyResult.results.zScore.TN,
                anomalyResult.results.zScore.FP,
                anomalyResult.results.zScore.FN,
                anomalyResult.results.zScore.precision,
                anomalyResult.results.zScore.recall,
                anomalyResult.results.zScore.f1Score,
                anomalyResult.results.zScore.falsePositiveRate,
                anomalyResult.results.zScore.accuracy
            ],

            [
                "Isolation Forest",
                anomalyResult.results.isolationForest.TP,
                anomalyResult.results.isolationForest.TN,
                anomalyResult.results.isolationForest.FP,
                anomalyResult.results.isolationForest.FN,
                anomalyResult.results.isolationForest.precision,
                anomalyResult.results.isolationForest.recall,
                anomalyResult.results.isolationForest.f1Score,
                anomalyResult.results.isolationForest.falsePositiveRate,
                anomalyResult.results.isolationForest.accuracy
            ],

            [
                "Hybrid",
                anomalyResult.results.hybrid.TP,
                anomalyResult.results.hybrid.TN,
                anomalyResult.results.hybrid.FP,
                anomalyResult.results.hybrid.FN,
                anomalyResult.results.hybrid.precision,
                anomalyResult.results.hybrid.recall,
                anomalyResult.results.hybrid.f1Score,
                anomalyResult.results.hybrid.falsePositiveRate,
                anomalyResult.results.hybrid.accuracy
            ]
        ];

        writeCsv(
            "anomalyDetectionResults.csv",

            [
                "Method",
                "TP",
                "TN",
                "FP",
                "FN",
                "Precision",
                "Recall",
                "F1",
                "FPR",
                "Accuracy"
            ],

            anomalyRows
        );

        /*
         * ==========================================
         * 2. FORECASTING RESULTS
         * ==========================================
         */

        console.log(
            "\nRunning forecasting experiment..."
        );

        const forecastingResult =
            await evaluateExpenseForecasting();

        writeJson(
            "forecastingResults.json",
            forecastingResult
        );

        /*
         * Exact structure verified from
         * forecastingEvaluationService.js
         */

        const rawForecast =
            forecastingResult
                .evaluation
                .rawForecast;

        const anomalyAwareForecast =
            forecastingResult
                .evaluation
                .anomalyAwareForecast;

        writeCsv(
            "forecastingResults.csv",

            [
                "Model",
                "MAE",
                "RMSE"
            ],

            [
                [
                    "Raw Linear Trend",
                    rawForecast.MAE,
                    rawForecast.RMSE
                ],

                [
                    "Anomaly-Aware Linear Trend",
                    anomalyAwareForecast.MAE,
                    anomalyAwareForecast.RMSE
                ]
            ]
        );

        /*
         * ==========================================
         * 3. EXPERIMENT SUMMARY
         * ==========================================
         */

        const summary = {

            generatedAt:
                new Date().toISOString(),

            dataset:
                forecastingResult.experiment,

            anomalyProcessing:
                forecastingResult
                    .anomalyProcessing,

            models:
                forecastingResult.models,

            anomalyDetection:
                anomalyResult.results,

            forecasting:
                forecastingResult.evaluation

        };

        writeJson(
            "researchExperimentSummary.json",
            summary
        );

        /*
         * ==========================================
         * 4. FINAL CONSOLE SUMMARY
         * ==========================================
         */

        console.log(
            "\n========================================"
        );

        console.log(
            "RESEARCH RESULTS EXPORT COMPLETE"
        );

        console.log(
            "========================================"
        );

        console.log(
            `Results directory:\n${resultsDirectory}`
        );

        console.log(
            "\nGenerated files:"
        );

        console.log(
            "1. anomalyDetectionResults.json"
        );

        console.log(
            "2. anomalyDetectionResults.csv"
        );

        console.log(
            "3. forecastingResults.json"
        );

        console.log(
            "4. forecastingResults.csv"
        );

        console.log(
            "5. researchExperimentSummary.json"
        );

        console.log(
            "========================================\n"
        );

        await mongoose.disconnect();

    } catch (error) {

        console.error(
            "\nResearch results export failed:"
        );

        console.error(error);

        try {
            await mongoose.disconnect();
        } catch {}

        process.exit(1);
    }
}

exportResults();