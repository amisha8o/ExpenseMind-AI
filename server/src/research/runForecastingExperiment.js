import mongoose from "mongoose";
import dotenv from "dotenv";

import {
    evaluateExpenseForecasting
} from "./forecastingEvaluationService.js";

dotenv.config();

async function runExperiment() {

    try {

        console.log(
            "\n========================================"
        );

        console.log(
            "EXPENSE FORECASTING RESEARCH EXPERIMENT"
        );

        console.log(
            "========================================"
        );

        await mongoose.connect(
            process.env.MONGO_URI
        );

        console.log(
            "MongoDB connected."
        );

        const result =
            await evaluateExpenseForecasting();

        console.log(
            "\n========================================"
        );

        console.log(
            "EXPERIMENT PROTOCOL"
        );

        console.log(
            "========================================"
        );

        console.log(
            JSON.stringify(
                result.experiment,
                null,
                2
            )
        );

        console.log(
            "\n========================================"
        );

        console.log(
            "ANOMALY PROCESSING"
        );

        console.log(
            "========================================"
        );

        console.log(
            JSON.stringify(
                result.anomalyProcessing,
                null,
                2
            )
        );

        console.log(
            "\n========================================"
        );

        console.log(
            "FORECASTING RESULTS"
        );

        console.log(
            "========================================"
        );

        console.log(
            JSON.stringify(
                result.evaluation,
                null,
                2
            )
        );

        console.log(
            "\n========================================"
        );

        console.log(
            "DAILY TEST RESULTS"
        );

        console.log(
            "========================================"
        );

        console.table(
            result.dailyResults
        );

        console.log(
            "\n========================================"
        );

        console.log(
            "EXPERIMENT COMPLETED SUCCESSFULLY"
        );

        console.log(
            "========================================\n"
        );

        await mongoose.disconnect();

    } catch (error) {

        console.error(
            "\nForecasting experiment failed:"
        );

        console.error(error);

        try {
            await mongoose.disconnect();
        } catch {}

        process.exit(1);
    }
}

runExperiment();