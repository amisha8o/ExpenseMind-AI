import Notification from "../models/Notification.js";

/**
 * Creates a notification for a user. Used internally by other
 * services/controllers (e.g. budget checks, goal completion, AI insights)
 * rather than exposed directly as a public write endpoint.
 */
export const createNotification = async ({ userId, type, title, message, link = "" }) => {
    return Notification.create({
        user: userId,
        type,
        title,
        message,
        link,
    });
};

export const getUnreadCount = async (userId) => {
    return Notification.countDocuments({ user: userId, isRead: false });
};
