import mongoose from "mongoose";
import dotenv from "dotenv";

import ResearchTransaction
    from "../models/ResearchTransaction.js";

dotenv.config();

const TRAIN_SIZE = 140;
const VALIDATION_SIZE = 30;
const TEST_SIZE = 30;

async function auditResearchSplit() {
    try {
        await mongoose.connect(
            process.env.MONGO_URI
        );

        console.log(
            "\nMongoDB connected."
        );

        const transactions =
            await ResearchTransaction
                .find({
                    type: "expense"
                })
                .sort({
                    date: 1,
                    _id: 1
                })
                .lean();

        console.log(
            `Total expense transactions: ${transactions.length}`
        );

        const expectedTotal =
            TRAIN_SIZE +
            VALIDATION_SIZE +
            TEST_SIZE;

        if (
            transactions.length !==
            expectedTotal
        ) {
            throw new Error(
                `Expected ${expectedTotal} expenses, but found ${transactions.length}.`
            );
        }

        /*
         * ==========================================
         * CHRONOLOGICAL SPLIT
         * ==========================================
         */

        const training =
            transactions.slice(
                0,
                TRAIN_SIZE
            );

        const validation =
            transactions.slice(
                TRAIN_SIZE,
                TRAIN_SIZE +
                    VALIDATION_SIZE
            );

        const test =
            transactions.slice(
                TRAIN_SIZE +
                    VALIDATION_SIZE
            );

        function getSplitStats(
            name,
            data
        ) {
            const anomalies =
                data.filter(
                    transaction =>
                        Number(
                            transaction.actualAnomaly
                        ) === 1
                );

            const normal =
                data.filter(
                    transaction =>
                        Number(
                            transaction.actualAnomaly
                        ) === 0
                );

            return {
                split: name,

                count: data.length,

                anomalies:
                    anomalies.length,

                normal:
                    normal.length,

                anomalyRate:
                    Number(
                        (
                            anomalies.length /
                            data.length *
                            100
                        ).toFixed(2)
                    ),

                startDate:
                    data[0]?.date || null,

                endDate:
                    data[data.length - 1]?.date ||
                    null,

                anomalyTransactions:
                    anomalies.map(
                        transaction => ({
                            transactionId:
                                transaction.transactionId,

                            date:
                                transaction.date,

                            amount:
                                transaction.amount,

                            category:
                                transaction.category,

                            anomalyType:
                                transaction.anomalyType
                        })
                    )
            };
        }

        const trainingStats =
            getSplitStats(
                "TRAINING",
                training
            );

        const validationStats =
            getSplitStats(
                "VALIDATION",
                validation
            );

        const testStats =
            getSplitStats(
                "TEST",
                test
            );

        console.log(
            "\n========================================"
        );

        console.log(
            "RESEARCH DATASET SPLIT AUDIT"
        );

        console.log(
            "========================================"
        );

        console.table([
            {
                Split: "Training",
                Transactions:
                    trainingStats.count,
                Anomalies:
                    trainingStats.anomalies,
                Normal:
                    trainingStats.normal,
                "Anomaly %":
                    trainingStats.anomalyRate,
                Start:
                    trainingStats.startDate,
                End:
                    trainingStats.endDate
            },

            {
                Split: "Validation",
                Transactions:
                    validationStats.count,
                Anomalies:
                    validationStats.anomalies,
                Normal:
                    validationStats.normal,
                "Anomaly %":
                    validationStats.anomalyRate,
                Start:
                    validationStats.startDate,
                End:
                    validationStats.endDate
            },

            {
                Split: "Test",
                Transactions:
                    testStats.count,
                Anomalies:
                    testStats.anomalies,
                Normal:
                    testStats.normal,
                "Anomaly %":
                    testStats.anomalyRate,
                Start:
                    testStats.startDate,
                End:
                    testStats.endDate
            }
        ]);

        console.log(
            "\n========================================"
        );

        console.log(
            "GROUND-TRUTH ANOMALIES BY SPLIT"
        );

        console.log(
            "========================================"
        );

        console.log(
            "\nTRAINING ANOMALIES:"
        );

        console.table(
            trainingStats.anomalyTransactions
        );

        console.log(
            "\nVALIDATION ANOMALIES:"
        );

        console.table(
            validationStats.anomalyTransactions
        );

        console.log(
            "\nTEST ANOMALIES:"
        );

        console.table(
            testStats.anomalyTransactions
        );

        /*
         * ==========================================
         * VALIDITY CHECK
         * ==========================================
         */

        const validationHasAnomaly =
            validationStats.anomalies > 0;

        const testHasAnomaly =
            testStats.anomalies > 0;

        const trainingHasAnomaly =
            trainingStats.anomalies > 0;

        console.log(
            "\n========================================"
        );

        console.log(
            "PROTOCOL VALIDITY"
        );

        console.log(
            "========================================"
        );

        console.log(
            `Training has anomaly   : ${
                trainingHasAnomaly
                    ? "YES ✅"
                    : "NO ❌"
            }`
        );

        console.log(
            `Validation has anomaly : ${
                validationHasAnomaly
                    ? "YES ✅"
                    : "NO ❌"
            }`
        );

        console.log(
            `Test has anomaly       : ${
                testHasAnomaly
                    ? "YES ✅"
                    : "NO ❌"
            }`
        );

        if (
            trainingHasAnomaly &&
            validationHasAnomaly &&
            testHasAnomaly
        ) {
            console.log(
                "\n✅ Chronological split contains ground-truth anomalies in all three sets."
            );

            console.log(
                "The split can proceed to experimental protocol validation."
            );
        } else {
            console.log(
                "\n⚠️ Chronological split is NOT suitable for threshold-selection validation."
            );

            console.log(
                "Do NOT tune the model or threshold using this split."
            );
        }

        console.log(
            "\n========================================\n"
        );

        await mongoose.disconnect();

    } catch (error) {

        console.error(
            "\nSplit audit failed:"
        );

        console.error(error);

        try {
            await mongoose.disconnect();
        } catch {}

        process.exit(1);
    }
}

auditResearchSplit();