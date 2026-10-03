import fs from "fs";
import path from "path";

import mongoose from "mongoose";
import dotenv from "dotenv";

import ResearchTransaction
    from "../models/ResearchTransaction.js";

dotenv.config();

const datasetPath = path.resolve(
    process.cwd(),
    "src",
    "research",
    "datasets",
    "expenseMindResearchDataset.json"
);

async function importDataset() {
    try {
        console.log(
            "\nConnecting to MongoDB..."
        );

        await mongoose.connect(
            process.env.MONGO_URI
        );

        console.log(
            "MongoDB connected successfully."
        );

        const rawData =
            fs.readFileSync(
                datasetPath,
                "utf-8"
            );

        const dataset =
            JSON.parse(rawData);

        const transactions =
            dataset.transactions;

        console.log(
            `Dataset transactions: ${transactions.length}`
        );

        /*
         * Remove previous research dataset.
         *
         * This makes the import reproducible.
         */
        await ResearchTransaction.deleteMany({});

        console.log(
            "Previous research dataset cleared."
        );

        const documents =
            transactions.map(
                transaction => ({
                    transactionId:
                        transaction.transactionId,

                    type:
                        transaction.type,

                    amount:
                        transaction.amount,

                    category:
                        transaction.category,

                    date:
                        new Date(
                            transaction.date
                        ),

                    paymentMethod:
                        transaction.paymentMethod,

                    merchant:
                        transaction.merchant,

                    actualAnomaly:
                        transaction.actualAnomaly,

                    anomalyType:
                        transaction.anomalyType
                })
            );

        await ResearchTransaction.insertMany(
            documents
        );

        const total =
            await ResearchTransaction.countDocuments();

        const expenses =
            await ResearchTransaction.countDocuments({
                type: "expense"
            });

        const income =
            await ResearchTransaction.countDocuments({
                type: "income"
            });

        const anomalies =
            await ResearchTransaction.countDocuments({
                type: "expense",
                actualAnomaly: 1
            });

        const normalExpenses =
            await ResearchTransaction.countDocuments({
                type: "expense",
                actualAnomaly: 0
            });

        console.log(
            "\n========================================"
        );

        console.log(
            "RESEARCH DATASET IMPORT COMPLETE"
        );

        console.log(
            "========================================"
        );

        console.log(
            `Total transactions : ${total}`
        );

        console.log(
            `Expense transactions: ${expenses}`
        );

        console.log(
            `Income transactions : ${income}`
        );

        console.log(
            `Normal expenses     : ${normalExpenses}`
        );

        console.log(
            `Known anomalies     : ${anomalies}`
        );

        console.log(
            "========================================\n"
        );

        await mongoose.disconnect();

        console.log(
            "MongoDB connection closed."
        );

    } catch (error) {

        console.error(
            "\nResearch dataset import failed:"
        );

        console.error(
            error
        );

        await mongoose.disconnect();

        process.exit(1);
    }
}

importDataset();