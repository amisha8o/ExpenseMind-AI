import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        title: {
            type: String,
            required: [true, "Expense title is required"],
            trim: true,
        },

        amount: {
            type: Number,
            required: [true, "Amount is required"],
            min: 0,
        },

         type: {
    type: String,
    enum: ["expense", "income"],
    default: "expense",
    required: true,
},

    
        category: {
            type: String,
            trim: true,
            default: "Other",
        },

        paymentMethod: {
            type: String,
            enum: ["Cash", "Card", "UPI", "Net Banking", "Wallet"],
            default: "UPI",
        },

        expenseDate: {
            type: Date,
            default: Date.now,
        },


        notes: {
            type: String,
            default: "",
        },

        receiptImage: {
            type: String,
            default: ""
        },

        merchant: {
            type: String,
            default: ""
        },

        location: {
            type: String,
            default: ""
        },

        currency: {
            type: String,
            default: "INR"
        },

        isRecurring: {
            type: Boolean,
            default: false
        },

        tags: [{
            type: String
        }]
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Expense", expenseSchema);