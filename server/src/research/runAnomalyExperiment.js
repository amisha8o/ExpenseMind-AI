import mongoose from "mongoose";
import dotenv from "dotenv";

import {
    evaluateAnomalyDetection
} from "./anomalyEvaluationService.js";

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
            await evaluateAnomalyDetection();

        console.log(
            "\n========================================"
        );

        console.log(
            "ANOMALY DETECTION EXPERIMENT"
        );

        console.log(
            "========================================"
        );

        console.log(
            JSON.stringify(
                result.results,
                null,
                2
            )
        );

        console.log(
            "\n========================================"
        );

        console.log(
            "CONFUSION MATRICES"
        );

        console.log(
            "========================================"
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
    "ISOLATION FOREST THRESHOLD SENSITIVITY"
);

console.log(
    "========================================"
);

console.table(
    result.thresholdSensitivity
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