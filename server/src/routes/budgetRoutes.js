import express from "express";

import {
    createBudget,
    getBudgets,
    getBudgetById,
    updateBudget,
    deleteBudget,
    getBudgetSummary,
    getBudgetIntelligence
} from "../controllers/budgetController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();


// Create Budget
router.post(
    "/",
    authMiddleware,
    createBudget
);


// Get All Budgets
router.get(
    "/",
    authMiddleware,
    getBudgets
);


// Budget Summary
router.get(
    "/summary",
    authMiddleware,
    getBudgetSummary
);


// Budget Intelligence
router.get(
    "/intelligence",
    authMiddleware,
    getBudgetIntelligence
);


// Get Single Budget
router.get(
    "/:id",
    authMiddleware,
    getBudgetById
);


// Update Budget
router.put(
    "/:id",
    authMiddleware,
    updateBudget
);


// Delete Budget
router.delete(
    "/:id",
    authMiddleware,
    deleteBudget
);


export default router;