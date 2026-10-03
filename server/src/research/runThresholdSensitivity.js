import mongoose from "mongoose";
import dotenv from "dotenv";

import {
    evaluateIsolationForestThresholds
} from "./anomalyThresholdSensitivityService.js";

dotenv.config();

async function runExperiment() {

    try {

        await mongoose.connect(
            process.env.MONGO_URI
        );

        console.log(
            "\nMongoDB connected."
        );

        const result =
            await evaluateIsolationForestThresholds();

        console.log(
            "\n========================================"
        );

        console.log(
            "ISOLATION FOREST THRESHOLD SENSITIVITY"
        );

        console.log(
            "========================================"
        );

        console.log(
            `Transactions: ${result.experiment.transactionCount}`
        );

        console.log(
            `Ground-truth anomalies: ${result.experiment.groundTruthAnomalies}`
        );

        console.log(
            "\nThreshold Results:"
        );

        console.table(
            result.results
        );

        console.log(
            "\nScore Statistics:"
        );

        console.log(
            result.scoreStatistics
        );

        console.log(
            "\nExperiment completed successfully."
        );

        await mongoose.disconnect();

    } catch (error) {

        console.error(
            "\nThreshold sensitivity experiment failed:"
        );

        console.error(error);

        process.exit(1);
    }
}

runExperiment();