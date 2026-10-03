import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        category: {
            type: String,
            trim: true,
            required: [true, "Category is required"],
        },

        limitAmount: {
            type: Number,
            required: [true, "Budget limit is required"],
            min: 0,
        },

        period: {
            type: String,
            enum: ["weekly", "monthly", "yearly"],
            default: "monthly",
        },

        month: {
            // 1-12, only relevant when period === "monthly"
            type: Number,
            min: 1,
            max: 12,
            default: () => new Date().getMonth() + 1,
        },

        year: {
            type: Number,
            default: () => new Date().getFullYear(),
        },

        alertThreshold: {
            // percentage (0-100) of limit at which to warn the user
            type: Number,
            min: 0,
            max: 100,
            default: 80,
        },

        notes: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

// Prevent duplicate budgets for the same user/category/month/year
budgetSchema.index(
    { user: 1, category: 1, month: 1, year: 1 },
    { unique: true }
);

export default mongoose.model("Budget", budgetSchema);
