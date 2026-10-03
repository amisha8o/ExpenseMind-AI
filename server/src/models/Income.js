import mongoose from "mongoose";

const incomeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    source: {
      type: String,
      required: [true, "Income source is required"],
      trim: true,
    },

    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: 0,
    },

    category: {
      type: String,
      trim: true,
      default: "Other",
    },

    incomeDate: {
      type: Date,
      default: Date.now,
    },

    paymentMethod: {
      type: String,
      enum: ["Cash", "UPI", "Bank Transfer", "Card"],
      default: "Bank Transfer",
    },

    notes: {
      type: String,
      default: "",
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Income", incomeSchema);