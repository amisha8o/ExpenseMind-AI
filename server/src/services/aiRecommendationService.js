import Expense from "../models/Expense.js";
import Income from "../models/Income.js";
import Budget from "../models/Budget.js";
import Goal from "../models/Goal.js";

import { detectExpenseAnomalies } from "./anomalyDetectionService.js";
import { getExpenseForecast } from "./expenseForecastingService.js";
import {
    getFinancialIntelligence
} from "./financialIntelligenceService.js";


// --------------------------------------------------
// Helper
// --------------------------------------------------

const round = (value, decimals = 2) => {
    return Number(Number(value || 0).toFixed(decimals));
};


// --------------------------------------------------
// Main AI Recommendation Engine
// --------------------------------------------------

export const generateFinancialRecommendations = async (userId) => {

    // --------------------------------------------------
    // 1. Get Financial Health
    // --------------------------------------------------

      const financialHealth =
    await getFinancialIntelligence(userId);

const healthScore =
    financialHealth?.financialHealthScore || 0;

    // --------------------------------------------------
    // 2. Get Anomaly Detection
    // --------------------------------------------------

    const anomalyResult = await detectExpenseAnomalies(userId);

    const anomalies = anomalyResult?.anomalies || [];

    // --------------------------------------------------
    // 3. Get Forecast
    // --------------------------------------------------

    let forecastResult = null;

    try {
        forecastResult = await getExpenseForecast(userId);
    } catch (error) {
        forecastResult = null;
    }


    // --------------------------------------------------
    // 4. Get Income
    // --------------------------------------------------

    const incomes = await Income.find({
        user: userId
    }).lean();


    // --------------------------------------------------
    // 5. Get Expenses
    // --------------------------------------------------

    const expenses = await Expense.find({
        user: userId,
        type: "expense"
    }).lean();


    // --------------------------------------------------
    // 6. Get Budgets
    // --------------------------------------------------

    const budgets = await Budget.find({
        user: userId
    }).lean();


    // --------------------------------------------------
    // 7. Get Goals
    // --------------------------------------------------

    const goals = await Goal.find({
        user: userId
    }).lean();


    // --------------------------------------------------
    // Financial Calculations
    // --------------------------------------------------

    const totalIncome = incomes.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
    );

    const totalExpense = expenses.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
    );

    const savings = totalIncome - totalExpense;

    const savingsRate =
        totalIncome > 0
            ? (savings / totalIncome) * 100
            : 0;


    // --------------------------------------------------
    // Category Analysis
    // --------------------------------------------------

    const categoryMap = {};

    expenses.forEach((expense) => {

        const category = expense.category || "Other";

        categoryMap[category] =
            (categoryMap[category] || 0) +
            Number(expense.amount || 0);
    });


    const categoryAnalysis = Object.entries(categoryMap)
        .map(([category, amount]) => ({
            category,
            amount: round(amount),
            percentage:
                totalExpense > 0
                    ? round((amount / totalExpense) * 100)
                    : 0
        }))
        .sort((a, b) => b.amount - a.amount);


    // --------------------------------------------------
    // Budget Analysis
    // --------------------------------------------------

    const budgetInsights = [];

    budgets.forEach((budget) => {

        const category = budget.category || "Other";

        const spent = categoryMap[category] || 0;

        const limit =
            Number(
                budget.limitAmount ??
                budget.amount ??
                0
            );

        if (limit <= 0) return;

        const utilization =
            (spent / limit) * 100;

        budgetInsights.push({
            category,
            limit: round(limit),
            spent: round(spent),
            utilization: round(utilization)
        });
    });


    // --------------------------------------------------
    // Goal Analysis
    // --------------------------------------------------

    const goalInsights = goals.map((goal) => {

        const target =
            Number(goal.targetAmount || 0);

        const saved =
            Number(goal.savedAmount || 0);

        const progress =
            target > 0
                ? (saved / target) * 100
                : 0;

        return {
            title: goal.title,
            targetAmount: round(target),
            savedAmount: round(saved),
            progress: round(Math.min(progress, 100)),
            deadline: goal.deadline,
            status: goal.status
        };
    });


    // --------------------------------------------------
    // Recommendations
    // --------------------------------------------------

    const recommendations = [];


    // ==================================================
    // RULE 1 — Savings
    // ==================================================

    if (savingsRate < 0) {

        recommendations.push({
            priority: "HIGH",
            category: "Savings",
            title: "Negative Savings Detected",
            message:
                `Your expenses exceed your recorded income by ₹${Math.abs(
                    round(savings)
                )}. Review discretionary spending and reduce non-essential expenses.`,
            metric: round(savingsRate),
            action:
                "Reduce unnecessary expenses and increase monthly income or savings."
        });

    } else if (savingsRate < 10) {

        recommendations.push({
            priority: "MEDIUM",
            category: "Savings",
            title: "Low Savings Rate",
            message:
                `Your current savings rate is ${round(
                    savingsRate
                )}%. Building a higher savings buffer can improve financial stability.`,
            metric: round(savingsRate),
            action:
                "Target a higher monthly savings percentage."
        });
    }


    // ==================================================
    // RULE 2 — Financial Health
    // ==================================================

    if (healthScore < 40) {

        recommendations.push({
            priority: "HIGH",
            category: "Financial Health",
            title: "Financial Health Needs Attention",
            message:
                `Your financial health score is ${round(
                    healthScore
                )}/100.`,
            metric: round(healthScore),
            action:
                "Focus on improving savings, controlling spending and maintaining financial goals."
        });

    } else if (healthScore < 60) {

        recommendations.push({
            priority: "MEDIUM",
            category: "Financial Health",
            title: "Improve Financial Stability",
            message:
                `Your financial health score is ${round(
                    healthScore
                )}/100.`,
            metric: round(healthScore),
            action:
                "Monitor spending patterns and improve monthly savings."
        });
    }


    // ==================================================
    // RULE 3 — High Spending Category
    // ==================================================

    if (categoryAnalysis.length > 0) {

        const highestCategory =
            categoryAnalysis[0];

        if (highestCategory.percentage >= 30) {

            recommendations.push({
                priority: "MEDIUM",
                category: "Spending",
                title: "High Category Spending",
                message:
                    `${highestCategory.category} accounts for ${highestCategory.percentage}% of your recorded expenses.`,
                metric:
                    highestCategory.percentage,
                action:
                    `Review your ${highestCategory.category.toLowerCase()} expenses and identify possible reductions.`
            });
        }
    }


    // ==================================================
    // RULE 4 — Budget Utilization
    // ==================================================

    budgetInsights.forEach((budget) => {

        if (budget.utilization > 100) {

            recommendations.push({
                priority: "HIGH",
                category: "Budget",
                title: "Budget Exceeded",
                message:
                    `${budget.category} spending has exceeded the budget by ₹${round(
                        budget.spent - budget.limit
                    )}.`,
                metric:
                    budget.utilization,
                action:
                    `Reduce ${budget.category.toLowerCase()} spending or revise the budget.`
            });

        } else if (budget.utilization >= 85) {

            recommendations.push({
                priority: "MEDIUM",
                category: "Budget",
                title: "Budget Near Limit",
                message:
                    `${budget.category} has used ${budget.utilization}% of its budget.`,
                metric:
                    budget.utilization,
                action:
                    `Monitor remaining ${budget.category.toLowerCase()} expenses carefully.`
            });
        }
    });


    // ==================================================
    // RULE 5 — Anomaly Detection
    // ==================================================

    if (anomalies.length > 0) {

        const highestAnomaly =
            [...anomalies]
                .sort(
                    (a, b) =>
                        Number(b.amount || 0) -
                        Number(a.amount || 0)
                )[0];

        recommendations.push({
            priority: "HIGH",
            category: "Anomaly",
            title: "Unusual Transaction Detected",
            message:
                `An unusual transaction of ₹${round(
                    highestAnomaly.amount
                )} was detected.`,
            metric:
                round(highestAnomaly.amount),
            action:
                "Review the transaction and verify whether it was expected."
        });
    }


    // ==================================================
    // RULE 6 — Goals
    // ==================================================

    goalInsights.forEach((goal) => {

        if (
            goal.status === "active" &&
            goal.progress < 50
        ) {

            recommendations.push({
                priority: "MEDIUM",
                category: "Goals",
                title: "Goal Progress Is Low",
                message:
                    `${goal.title} is currently ${goal.progress}% completed.`,
                metric:
                    goal.progress,
                action:
                    "Increase the amount allocated toward this financial goal."
            });
        }
    });


    // ==================================================
    // RULE 7 — Forecast
    // ==================================================

    const forecast30Day =
        forecastResult?.forecast?.anomalyAware30DayForecast ??
        forecastResult?.forecast?.raw30DayForecast ??
        0;

    if (
        forecast30Day > 0 &&
        totalIncome > 0 &&
        forecast30Day > totalIncome
    ) {

        recommendations.push({
            priority: "HIGH",
            category: "Forecast",
            title: "Projected Spending Risk",
            message:
                `The estimated 30-day expense is ₹${round(
                    forecast30Day
                )}, which is above your recorded income of ₹${round(
                    totalIncome
                )}.`,
            metric:
                round(forecast30Day),
            action:
                "Reduce projected discretionary spending and review your expense pattern."
        });
    }


    // --------------------------------------------------
    // Priority Ordering
    // --------------------------------------------------

    const priorityWeight = {
        HIGH: 3,
        MEDIUM: 2,
        LOW: 1
    };

    recommendations.sort(
        (a, b) =>
            priorityWeight[b.priority] -
            priorityWeight[a.priority]
    );


    // --------------------------------------------------
    // Final Response
    // --------------------------------------------------

    return {

        success: true,

        generatedAt: new Date(),

        financialSummary: {
            totalIncome: round(totalIncome),
            totalExpense: round(totalExpense),
            savings: round(savings),
            savingsRate: round(savingsRate),
            financialHealthScore: round(healthScore)
        },

        riskSignals: {
            anomalyCount: anomalies.length,
            budgetRisks: budgetInsights.filter(
                item => item.utilization >= 85
            ).length,
            goalRisks: goalInsights.filter(
                item => item.progress < 50 &&
                    item.status === "active"
            ).length
        },

        categoryAnalysis,

        budgetInsights,

        goalInsights,

        forecast: forecastResult
            ? {
                nextDay:
                    round(
                        forecastResult.forecast?.nextDayForecast
                    ),
                raw30Day:
                    round(
                        forecastResult.forecast?.raw30DayForecast
                    ),
                anomalyAware30Day:
                    round(
                        forecastResult.forecast?.anomalyAware30DayForecast
                    )
            }
            : null,

        recommendationCount:
            recommendations.length,

        recommendations
    };
};