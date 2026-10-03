import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
    getDashboardSummary,
    getMonthlyAnalytics,
    getWeeklyAnalytics,
    getCategoryAnalytics,
    getRecentTransactions,
    getFinancialHealth
} from "../services/dashboardService.js";

// Dashboard Summary
export const dashboardSummary = asyncHandler(async (req, res) => {

    const summary = await getDashboardSummary(req.user._id);

    res.status(200).json(
        new ApiResponse(
            200,
            "Dashboard Summary Fetched Successfully",
            summary
        )
    );

});

// Monthly Analytics
export const monthlyAnalytics = asyncHandler(async (req, res) => {

    const analytics = await getMonthlyAnalytics(req.user._id);

    res.status(200).json(
        new ApiResponse(
            200,
            "Monthly Analytics Fetched Successfully",
            analytics
        )
    );

});

// Weekly Analytics
export const weeklyAnalytics = asyncHandler(async (req, res) => {

    const analytics = await getWeeklyAnalytics(req.user._id);

    res.status(200).json(
        new ApiResponse(
            200,
            "Weekly Analytics Fetched Successfully",
            analytics
        )
    );

});

// Category Analytics
export const categoryAnalytics = asyncHandler(async (req, res) => {

    const data = await getCategoryAnalytics(req.user._id);

    res.status(200).json(
        new ApiResponse(
            200,
            "Category Analytics Fetched Successfully",
            data
        )
    );

});

// Recent Transactions
export const recentTransactions = asyncHandler(async (req, res) => {

    const transactions = await getRecentTransactions(req.user._id);

    res.status(200).json(
        new ApiResponse(
            200,
            "Recent Transactions Fetched Successfully",
            transactions
        )
    );

});

// Financial Health
export const financialHealth = asyncHandler(async (req, res) => {

    const health = await getFinancialHealth(req.user._id);

    res.status(200).json(
        new ApiResponse(
            200,
            "Financial Health Calculated Successfully",
            health
        )
    );

});