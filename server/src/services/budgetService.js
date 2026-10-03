import Expense from "../models/Expense.js";
import Budget from "../models/Budget.js";

/**
 * Calculate actual spending for a budget
 * based on user, category, month and year.
 */
export const getBudgetSpend = async (budget) => {
    const {
        user,
        category,
        month,
        year
    } = budget;

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const result = await Expense.aggregate([
        {
            $match: {
                user,
                category,
                type: "expense",
                expenseDate: {
                    $gte: start,
                    $lt: end
                }
            }
        },
        {
            $group: {
                _id: null,
                total: {
                    $sum: "$amount"
                }
            }
        }
    ]);

    return result.length
        ? Number(result[0].total || 0)
        : 0;
};


/**
 * Generate intelligent analytics
 * for a single budget.
 */
export const enrichBudget = async (budget) => {

    // Works with both Mongoose document and plain object
    const budgetData =
        typeof budget.toObject === "function"
            ? budget.toObject()
            : budget;

    // Support both possible field names
    const budgetLimit = Number(
        budgetData.limitAmount ??
        budgetData.amount ??
        0
    );

    const actualSpending = Number(
        await getBudgetSpend(budgetData)
    );

    /**
     * Utilization percentage
     */
    const utilizationPercentage =
        budgetLimit > 0
            ? Number(
                (
                    (actualSpending / budgetLimit) * 100
                ).toFixed(2)
            )
            : 0;


    /**
     * Remaining budget
     */
    const remainingBudget = Math.max(
        budgetLimit - actualSpending,
        0
    );


    /**
     * Overspending amount
     */
    const overspendingAmount = Math.max(
        actualSpending - budgetLimit,
        0
    );


    /**
     * Alert threshold
     */
    const alertThreshold = Number(
        budgetData.alertThreshold ?? 80
    );


    /**
     * Budget status
     */
    let budgetStatus = "Safe";

    if (utilizationPercentage >= 100) {
        budgetStatus = "Exceeded";
    } else if (utilizationPercentage >= alertThreshold) {
        budgetStatus = "Warning";
    }


    /**
     * Intelligent recommendation
     */
    let recommendation =
        "Your spending is within the planned budget.";

    if (budgetStatus === "Warning") {
        recommendation =
            `You have used ${utilizationPercentage}% of your ${budgetData.category} budget. Consider reducing spending in this category.`;
    }

    if (budgetStatus === "Exceeded") {
        recommendation =
            `Your ${budgetData.category} spending has exceeded the budget by ₹${overspendingAmount.toLocaleString("en-IN")}. Consider controlling further spending in this category.`;
    }


    /**
     * Research-oriented output
     */
    return {
        ...budgetData,

        // Original application fields
        limitAmount: budgetLimit,
        spent: actualSpending,
        remaining: remainingBudget,
        percentUsed: utilizationPercentage,
        status: budgetStatus.toLowerCase(),

        // Research variables
        budget_limit: budgetLimit,
        actual_spending: actualSpending,
        utilization_percentage: utilizationPercentage,
        remaining_budget: remainingBudget,
        overspending_amount: overspendingAmount,
        budget_status: budgetStatus,

        // Recommendation
        recommendation
    };
};


/**
 * Enrich multiple budgets.
 *
 * This function was missing and was causing:
 *
 * "does not provide an export named enrichBudgetList"
 */
export const enrichBudgetList = async (budgets) => {

    if (!Array.isArray(budgets)) {
        return [];
    }

    const enrichedBudgets = await Promise.all(
        budgets.map((budget) => enrichBudget(budget))
    );

    return enrichedBudgets;
};


/**
 * Generate intelligent budget analytics
 * for the current month.
 */
export const getBudgetIntelligenceService = async (userId) => {

    const budgets = await Budget.find({
        user: userId
    }).lean();


    const startOfMonth = new Date();

    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);


    const endOfMonth = new Date(
        startOfMonth.getFullYear(),
        startOfMonth.getMonth() + 1,
        1
    );


    const expenses = await Expense.find({
        user: userId,
        type: "expense",
        expenseDate: {
            $gte: startOfMonth,
            $lt: endOfMonth
        }
    }).lean();


    /**
     * Calculate spending category-wise
     */
    const categorySpending = {};

    expenses.forEach((expense) => {

        const category =
            expense.category || "Other";

        categorySpending[category] =
            (categorySpending[category] || 0) +
            Number(expense.amount || 0);
    });


    /**
     * Generate intelligence for every budget
     */
    const intelligence = budgets.map((budget) => {

        const category =
            budget.category || "Other";


        const budgetAmount = Number(
            budget.limitAmount ??
            budget.amount ??
            0
        );


        const spentAmount = Number(
            categorySpending[category] || 0
        );


        const remainingAmount =
            Math.max(
                budgetAmount - spentAmount,
                0
            );


        const overspendingAmount =
            Math.max(
                spentAmount - budgetAmount,
                0
            );


        const utilization =
            budgetAmount > 0
                ? Number(
                    (
                        (spentAmount / budgetAmount) *
                        100
                    ).toFixed(2)
                )
                : 0;


        let status = "Healthy";

        let alert =
            "Spending is within the budget.";


        if (utilization >= 100) {

            status = "Exceeded";

            alert =
                `Budget has been exceeded by ₹${overspendingAmount.toLocaleString("en-IN")}.`;

        } else if (utilization >= 80) {

            status = "Warning";

            alert =
                "Spending is close to the budget limit.";

        }


        return {

            budgetId: budget._id,

            category,

            budgetAmount,

            spentAmount,

            remainingAmount,

            overspendingAmount,

            utilization,

            status,

            alert
        };
    });


    return {

        month: startOfMonth.toLocaleString(
            "en-US",
            {
                month: "long"
            }
        ),

        year: startOfMonth.getFullYear(),

        totalBudgets: budgets.length,

        intelligence
    };
};