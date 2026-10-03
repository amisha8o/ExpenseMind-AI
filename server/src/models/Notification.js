import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        type: {
            type: String,
            enum: [
                "budget-warning",
                "budget-exceeded",
                "goal-progress",
                "goal-completed",
                "ai-insight",
                "system",
            ],
            default: "system",
        },

        title: {
            type: String,
            required: [true, "Notification title is required"],
            trim: true,
        },

        message: {
            type: String,
            required: [true, "Notification message is required"],
        },

        isRead: {
            type: Boolean,
            default: false,
        },

        link: {
            // optional frontend route/page this notification points to
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

notificationSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
