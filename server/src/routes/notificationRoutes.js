import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
    getNotifications,
    getUnreadNotificationCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get(
    "/",
    authMiddleware,
    getNotifications
);

router.get(
    "/unread-count",
    authMiddleware,
    getUnreadNotificationCount
);

router.patch(
    "/:id/read",
    authMiddleware,
    markAsRead
);

router.patch(
    "/read-all",
    authMiddleware,
    markAllAsRead
);

router.delete(
    "/:id",
    authMiddleware,
    deleteNotification
);

export default router;
