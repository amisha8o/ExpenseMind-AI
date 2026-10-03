import mongoose from "mongoose";
import dotenv from "dotenv";

import {
    runFinalAnomalyExperiment
} from "./finalAnomalyExperimentService.js";

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
            await runFinalAnomalyExperiment();


        console.log(
            "\n========================================"
        );

        console.log(
            "FINAL ANOMALY EXPERIMENT"
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
            "VALIDATION THRESHOLD SENSITIVITY"
        );

        console.log(
            "========================================"
        );

        console.table(
            result.validation
                .thresholdSensitivity
        );


        console.log(
            "\nSelected threshold:",
            result.validation
                .selectedThreshold
        );


        console.log(
            "\n========================================"
        );

        console.log(
            "FINAL TEST RESULTS"
        );

        console.log(
            "========================================"
        );

        console.table({

            "Z-Score":
                result.finalTestResults
                    .zScore,

            "Isolation Forest":
                result.finalTestResults
                    .isolationForest,

            "Hybrid":
                result.finalTestResults
                    .hybrid
        });


        console.log(
            "\n========================================"
        );

        console.log(
            "FINAL TEST PREDICTIONS"
        );

        console.log(
            "========================================"
        );

        console.table(
            result.predictions
        );


        console.log(
            "\nExperiment completed successfully."
        );


        await mongoose.disconnect();

    } catch (error) {

        console.error(
            "\nExperiment failed:"
        );

        console.error(error);

        process.exit(1);
    }
}

runExperiment();