import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
    dashboardSummary,
    monthlyAnalytics,
    weeklyAnalytics,
    categoryAnalytics,
    recentTransactions
} from "../controllers/dashboardController.js";

import {
    getFinancialHealth
} from "../controllers/financialIntelligenceController.js";


const router = express.Router();


// =====================================================
// DASHBOARD ROUTES
// =====================================================

// Dashboard Summary
router.get(
    "/summary",
    authMiddleware,
    dashboardSummary
);


// Monthly Analytics
router.get(
    "/monthly",
    authMiddleware,
    monthlyAnalytics
);


// Weekly Analytics
router.get(
    "/weekly",
    authMiddleware,
    weeklyAnalytics
);


// Category Analytics
router.get(
    "/category",
    authMiddleware,
    categoryAnalytics
);


// Recent Transactions
router.get(
    "/recent",
    authMiddleware,
    recentTransactions
);


// =====================================================
// FINANCIAL HEALTH
// Uses NEW Financial Intelligence Engine
// =====================================================

router.get(
    "/health",
    authMiddleware,
    getFinancialHealth
);


export default router;