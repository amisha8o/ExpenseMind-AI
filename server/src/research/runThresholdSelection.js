import mongoose from "mongoose";
import dotenv from "dotenv";

import {
    selectValidationThreshold
} from "./validationThresholdSelection.js";

dotenv.config();

async function runThresholdSelection() {

    try {

        await mongoose.connect(
            process.env.MONGO_URI
        );

        console.log(
            "\nMongoDB connected."
        );

        const result =
            await selectValidationThreshold();

        console.log(
            "\n========================================"
        );

        console.log(
            "5E-2 VALIDATION THRESHOLD SELECTION"
        );

        console.log(
            "========================================"
        );

        console.log(
            "\nProtocol:"
        );

        console.table(
            result.protocol
        );

        console.log(
            "\nTraining statistics:"
        );

        console.table(
            result.trainingStatistics
        );

        console.log(
            "\nValidation ground truth:"
        );

        console.table(
            result.validationGroundTruth
        );

        console.log(
            "\nThreshold comparison:"
        );

        console.table(
            result.thresholdResults.map(
                item => ({
                    threshold:
                        item.threshold,

                    detected:
                        item.detected,

                    TP:
                        item.metrics.TP,

                    TN:
                        item.metrics.TN,

                    FP:
                        item.metrics.FP,

                    FN:
                        item.metrics.FN,

                    precision:
                        item.metrics.precision,

                    recall:
                        item.metrics.recall,

                    F1:
                        item.metrics.f1Score,

                    FPR:
                        item.metrics
                            .falsePositiveRate
                })
            )
        );

        console.log(
            "\n========================================"
        );

        console.log(
            "🔒 LOCKED THRESHOLD"
        );

        console.log(
            "========================================"
        );

        console.log(
            `Threshold: ${result.selectedThreshold.value}`
        );

        console.log(
            "\nValidation metrics:"
        );

        console.table(
            result.selectedThreshold
                .validationMetrics
        );

        console.log(
            "\nTest audit:"
        );

        console.table(
            result.testAudit
        );

        console.log(
            "\n========================================"
        );

        console.log(
            "5E-2 COMPLETE"
        );

        console.log(
            "Test data was NOT used for threshold selection."
        );

        console.log(
            "========================================\n"
        );

        await mongoose.disconnect();

    } catch (error) {

        console.error(
            "\nThreshold selection failed:"
        );

        console.error(error);

        await mongoose.disconnect();

        process.exit(1);
    }
}

runThresholdSelection();