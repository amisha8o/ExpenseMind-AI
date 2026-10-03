import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        title: {
            type: String,
            required: [true, "Goal title is required"],
            trim: true,
        },

        targetAmount: {
            type: Number,
            required: [true, "Target amount is required"],
            min: 0.01,
        },

        savedAmount: {
            type: Number,
            default: 0,
            min: 0,
        },

        deadline: {
            type: Date,
        },

        category: {
            type: String,
            enum: [
                "Emergency Fund",
                "Travel",
                "Vehicle",
                "Home",
                "Education",
                "Retirement",
                "Gadget",
                "Wedding",
                "Investment",
                "Other",
            ],
            default: "Other",
        },

        icon: {
            type: String,
            default: "target",
        },

        status: {
            type: String,
            enum: ["active", "completed", "abandoned"],
            default: "active",
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

// Auto-mark as completed when saved amount reaches the target
goalSchema.pre("save", function (next) {
    if (this.savedAmount >= this.targetAmount && this.status === "active") {
        this.status = "completed";
    }
    next();
});

export default mongoose.model("Goal", goalSchema);
