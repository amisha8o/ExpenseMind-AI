import express from "express";

import {
    createGoal,
    getGoals,
    getGoalById,
    updateGoal,
    deleteGoal,
    getGoalSummary,
    contributeToGoal
} from "../controllers/goalController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();


// Create Goal
router.post(
    "/",
    authMiddleware,
    createGoal
);


// Get All Goals
router.get(
    "/",
    authMiddleware,
    getGoals
);


// Goal Summary
router.get(
    "/summary",
    authMiddleware,
    getGoalSummary
);


// Add / withdraw funds
router.post(
    "/:id/contribute",
    authMiddleware,
    contributeToGoal
);

// Get Single Goal
router.get(
    "/:id",
    authMiddleware,
    getGoalById
);


// Update Goal
router.put(
    "/:id",
    authMiddleware,
    updateGoal
);


// Delete Goal
router.delete(
    "/:id",
    authMiddleware,
    deleteGoal
);


export default router;