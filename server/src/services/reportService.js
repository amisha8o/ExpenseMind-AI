import Expense from "../models/Expense.js";
import Income from "../models/Income.js";

/**
 * Builds a full income vs. expense report for a given date range,
 * including category breakdown — used by the Reports page.
 */
export const buildReport = async (userId, startDate, endDate) => {

    const rangeQuery = {};
    if (startDate) rangeQuery.$gte = new Date(startDate);
    if (endDate) rangeQuery.$lte = new Date(endDate);

    const expenseFilter = { user: userId };
    const incomeFilter = { user: userId };

    if (startDate || endDate) {
        expenseFilter.expenseDate = rangeQuery;
        incomeFilter.incomeDate = rangeQuery;
    }

    const [expenses, incomes] = await Promise.all([
        Expense.find(expenseFilter).sort({ expenseDate: -1 }),
        Income.find(incomeFilter).sort({ incomeDate: -1 }),
    ]);

    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

    const categoryBreakdown = {};
    for (const expense of expenses) {
        categoryBreakdown[expense.category] =
            (categoryBreakdown[expense.category] || 0) + expense.amount;
    }

    const categoryBreakdownArray = Object.entries(categoryBreakdown)
        .map(([category, total]) => ({
            category,
            total,
            percent: totalExpense > 0 ? Math.round((total / totalExpense) * 100) : 0,
        }))
        .sort((a, b) => b.total - a.total);

    return {
        range: { startDate: startDate || null, endDate: endDate || null },
        totalIncome,
        totalExpense,
        netSavings: totalIncome - totalExpense,
        savingsRate: totalIncome > 0
            ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100)
            : 0,
        categoryBreakdown: categoryBreakdownArray,
        transactionCount: expenses.length + incomes.length,
        expenses,
        incomes,
    };
};
