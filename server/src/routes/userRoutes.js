import express from "express";
import { body } from "express-validator";

import authMiddleware from "../middleware/authMiddleware.js";

import {
    updateProfile,
    changePassword,
    deleteAccount,
} from "../controllers/userController.js";

const router = express.Router();

const updateProfileValidator = [
    body("email").optional().isEmail().withMessage("Must be a valid email"),
    body("fullName").optional().trim().notEmpty().withMessage("Full name cannot be empty"),
    body("currency").optional().isIn(["USD", "EUR", "GBP", "INR", "JPY"]),
    body("aiSensitivity")
        .optional()
        .isIn(["Aggressive Saving", "Balanced Allocation", "Growth & Investments"]),
];

router.put(
    "/profile",
    authMiddleware,
    updateProfileValidator,
    updateProfile
);

router.put(
    "/change-password",
    authMiddleware,
    changePassword
);

router.delete(
    "/account",
    authMiddleware,
    deleteAccount
);

export default router;
