import mongoose from "mongoose";
import dotenv from "dotenv";

import {
    runFinalAnomalyEvaluation
} from "./finalAnomalyEvaluation.js";

dotenv.config();

async function run() {

    try {

        await mongoose.connect(
            process.env.MONGO_URI
        );

        console.log(
            "\nMongoDB connected."
        );

        const result =
            await runFinalAnomalyEvaluation();

        console.log(
            "\n========================================"
        );

        console.log(
            "FINAL UNSEEN TEST EVALUATION"
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
            "\nFINAL TEST RESULTS"
        );

        console.table({
            "Z-Score":
                result.results.zScore,

            "Isolation Forest":
                result.results.isolationForest,

            "Hybrid":
                result.results.hybrid
        });

        console.log(
            "\n========================================"
        );

        console.log(
            "TRAINING STATISTICS"
        );

        console.log(
            result.trainingStatistics
        );

        console.log(
            "\n========================================"
        );

        console.log(
            "TEST PREDICTIONS"
        );

        console.table(
            result.testPredictions
        );

        console.log(
            "\nFinal experiment completed successfully."
        );

        await mongoose.disconnect();

    } catch (error) {

        console.error(
            "\nFinal experiment failed:"
        );

        console.error(error);

        process.exit(1);
    }
}

run();