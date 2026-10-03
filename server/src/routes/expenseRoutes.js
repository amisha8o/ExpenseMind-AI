import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
    addExpense,
    getExpenses,
    getExpenseById,
    updateExpense,
    deleteExpense,
} from "../controllers/expenseController.js";

import {
    expenseValidator,
} from "../validators/expenseValidator.js";

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    expenseValidator,
    addExpense
);

router.get(
    "/",
    authMiddleware,
    getExpenses
);

router.get(
    "/:id",
    authMiddleware,
    getExpenseById
);

router.put(
    "/:id",
    authMiddleware,
    updateExpense
);

router.delete(
    "/:id",
    authMiddleware,
    deleteExpense
);

export default router;