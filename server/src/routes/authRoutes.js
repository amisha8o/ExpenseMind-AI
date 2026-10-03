import express from "express";

import {
    register,
    login,
    profile,
    forgotPassword,
    resetPassword,
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";

import {
    registerValidator,
    loginValidator,
} from "../validators/authValidator.js";

const router = express.Router();

router.post("/register", registerValidator, register);

router.post("/login", loginValidator, login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.get("/profile", authMiddleware, profile);

export default router;