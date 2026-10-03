import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
    getDashboardSummary,
    getCategoryAnalytics,
    getRecentTransactions,
    getFinancialHealth
} from "../services/dashboardService.js";

import { analyzeFinance } from "../services/geminiService.js";

export const analyzeFinancialData = asyncHandler(async (req, res) => {

    const userId = req.user._id;

    // NEW: read the user's actual question from the request body
    const { query } = req.body;

    if (!query || typeof query !== "string" || !query.trim()) {
        return res.status(400).json(
            new ApiResponse(400, "Query is required", null)
        );
    }

    const summary = await getDashboardSummary(userId);
    const categories = await getCategoryAnalytics(userId);
    const recentTransactions = await getRecentTransactions(userId);
    const health = await getFinancialHealth(userId);

    // NEW: pass the user's query into the AI service
    const report = await analyzeFinance(
        {
            ...summary,
            ...health,
            categories,
            recentTransactions
        },
        query
    );

    res.status(200).json(
        new ApiResponse(200, "Financial Analysis Generated Successfully", report)
    );

});