import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
    addIncome,
    getIncome,
    getIncomeById,
    updateIncome,
    deleteIncome,
} from "../controllers/incomeController.js";

import {
    incomeValidator,
} from "../validators/incomeValidator.js";

const router = express.Router();

router.post("/", authMiddleware, incomeValidator, addIncome);

router.get("/", authMiddleware, getIncome);

router.get("/:id", authMiddleware, getIncomeById);

router.put("/:id", authMiddleware, updateIncome);

router.delete("/:id", authMiddleware, deleteIncome);

export default router;