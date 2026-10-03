import mongoose from "mongoose";

const researchTransactionSchema =
    new mongoose.Schema(
        {
            transactionId: {
                type: String,
                required: true,
                unique: true,
                index: true
            },

            type: {
                type: String,
                enum: ["expense", "income"],
                required: true
            },

            amount: {
                type: Number,
                required: true,
                min: 0
            },

            category: {
                type: String,
                required: true
            },

            date: {
                type: Date,
                required: true,
                index: true
            },

            paymentMethod: {
                type: String,
                required: true
            },

            merchant: {
                type: String,
                default: ""
            },

            // Ground-truth label.
            // This is NOT the model prediction.
            actualAnomaly: {
                type: Number,
                enum: [0, 1],
                required: true,
                default: 0,
                index: true
            },

            anomalyType: {
                type: String,
                enum: [
                    "none",
                    "extreme_amount",
                    "unusual_category",
                    "unusual_frequency"
                ],
                default: "none"
            }
        },
        {
            timestamps: true
        }
    );

const ResearchTransaction =
    mongoose.model(
        "ResearchTransaction",
        researchTransactionSchema
    );

export default ResearchTransaction;