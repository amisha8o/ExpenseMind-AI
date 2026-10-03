import express from "express";

import {
    financialIntelligence
} from "../controllers/financialIntelligenceController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import {
    getFinancialHealth
} from "../controllers/financialIntelligenceController.js";

const router = express.Router();


// Get Financial Intelligence
router.get(
    "/",
    authMiddleware,
    financialIntelligence
);

router.get(
    "/health",
    authMiddleware,
    getFinancialHealth
);

export default router;