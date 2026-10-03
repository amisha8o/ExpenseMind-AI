import Notification from "../models/Notification.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getUnreadCount } from "../services/notificationService.js";

// Get All Notifications (most recent first)
export const getNotifications = asyncHandler(async (req, res) => {

    const filter = { user: req.user._id };
    if (req.query.unreadOnly === "true") filter.isRead = false;

    const limit = Math.min(Number(req.query.limit) || 20, 100);

    const notifications = await Notification.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit);

    res.status(200).json(
        new ApiResponse(200, "Notifications fetched successfully", notifications)
    );
});

// Get Unread Count (for navbar bell badge)
export const getUnreadNotificationCount = asyncHandler(async (req, res) => {

    const count = await getUnreadCount(req.user._id);

    res.status(200).json(
        new ApiResponse(200, "Unread count fetched successfully", { count })
    );
});

// Mark a single notification as read
export const markAsRead = asyncHandler(async (req, res) => {

    const notification = await Notification.findOne({
        _id: req.params.id,
        user: req.user._id,
    });

    if (!notification) {
        throw new ApiError(404, "Notification not found");
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json(
        new ApiResponse(200, "Notification marked as read", notification)
    );
});

// Mark all notifications as read
export const markAllAsRead = asyncHandler(async (req, res) => {

    await Notification.updateMany(
        { user: req.user._id, isRead: false },
        { $set: { isRead: true } }
    );

    res.status(200).json(
        new ApiResponse(200, "All notifications marked as read")
    );
});

// Delete a notification
export const deleteNotification = asyncHandler(async (req, res) => {

    const notification = await Notification.findOne({
        _id: req.params.id,
        user: req.user._id,
    });

    if (!notification) {
        throw new ApiError(404, "Notification not found");
    }

    await notification.deleteOne();

    res.status(200).json(
        new ApiResponse(200, "Notification deleted successfully")
    );
});
