import Expense from "../models/Expense.js";
import Income from "../models/Income.js";
import Budget from "../models/Budget.js";
import Goal from "../models/Goal.js";

export const getDashboardSummary = async (userId) => {

    const incomes = await Income.find({ user: userId });
    const expenses = await Expense.find({ user: userId });

    const totalIncome = incomes.reduce(
        (sum, income) => sum + income.amount,
        0
    );

    const totalExpense = expenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
    );

    return {
        totalIncome,
        totalExpense,
        currentBalance: totalIncome - totalExpense,
        totalTransactions: incomes.length + expenses.length,
    };
};

// Monthly Analytics
export const getMonthlyAnalytics = async (userId) => {
    const now = new Date();

    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const startOfMonth = new Date(
        currentYear,
        currentMonth,
        1
    );

    const startOfNextMonth = new Date(
        currentYear,
        currentMonth + 1,
        1
    );

    // Monthly Income
    const incomeResult = await Income.aggregate([
        {
            $match: {
                user: userId,
                incomeDate: {
                    $gte: startOfMonth,
                    $lt: startOfNextMonth
                }
            }
        },
        {
            $group: {
                _id: null,
                totalIncome: {
                    $sum: "$amount"
                },
                transactionCount: {
                    $sum: 1
                }
            }
        }
    ]);

    // Monthly Expense
    const expenseResult = await Expense.aggregate([
        {
            $match: {
                user: userId,
                expenseDate: {
                    $gte: startOfMonth,
                    $lt: startOfNextMonth
                }
            }
        },
        {
            $group: {
                _id: null,
                totalExpense: {
                    $sum: "$amount"
                },
                transactionCount: {
                    $sum: 1
                }
            }
        }
    ]);

    const monthlyIncome = incomeResult[0]?.totalIncome || 0;
    const monthlyExpense = expenseResult[0]?.totalExpense || 0;

    const incomeTransactions =
        incomeResult[0]?.transactionCount || 0;

    const expenseTransactions =
        expenseResult[0]?.transactionCount || 0;

    const balance = monthlyIncome - monthlyExpense;

    const savingsRate =
        monthlyIncome > 0
            ? (balance / monthlyIncome) * 100
            : 0;

    return {
        month: currentMonth + 1,
        year: currentYear,

        monthlyIncome,
        monthlyExpense,
        balance,

        savingsRate: Number(
            savingsRate.toFixed(2)
        ),

        incomeTransactions,
        expenseTransactions,

        totalTransactions:
            incomeTransactions + expenseTransactions
    };
};

// Weekly Cash Flow Analytics
export const getWeeklyAnalytics = async (userId) => {
    const now = new Date();

    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const startOfMonth = new Date(
        currentYear,
        currentMonth,
        1
    );

    const startOfNextMonth = new Date(
        currentYear,
        currentMonth + 1,
        1
    );

    const expenses = await Expense.find({
        user: userId,
        expenseDate: {
            $gte: startOfMonth,
            $lt: startOfNextMonth
        }
    }).lean();

    const incomes = await Income.find({
        user: userId,
        incomeDate: {
            $gte: startOfMonth,
            $lt: startOfNextMonth
        }
    }).lean();

    const weeks = [
        {
            label: "W1",
            income: 0,
            expense: 0
        },
        {
            label: "W2",
            income: 0,
            expense: 0
        },
        {
            label: "W3",
            income: 0,
            expense: 0
        },
        {
            label: "W4",
            income: 0,
            expense: 0
        }
    ];

    incomes.forEach((income) => {
        const day = new Date(income.incomeDate).getDate();

        const weekIndex = Math.min(
            3,
            Math.floor((day - 1) / 7)
        );

        weeks[weekIndex].income += Number(
            income.amount || 0
        );
    });

    expenses.forEach((expense) => {
        const day = new Date(expense.expenseDate).getDate();

        const weekIndex = Math.min(
            3,
            Math.floor((day - 1) / 7)
        );

        weeks[weekIndex].expense += Number(
            expense.amount || 0
        );
    });

    return {
        month: currentMonth + 1,
        year: currentYear,
        weeks
    };
};



// Category Analytics
export const getCategoryAnalytics = async (userId) => {

    const categoryData = await Expense.aggregate([
        {
            $match: {
                user: userId
            }
        },
        {
            $group: {
                _id: "$category",
                totalAmount: {
                    $sum: "$amount"
                },
                transactionCount: {
                    $sum: 1
                }
            }
        },
        {
            $sort: {
                totalAmount: -1
            }
        }
    ]);

    const totalExpense = categoryData.reduce(
        (sum, item) => sum + Number(item.totalAmount || 0),
        0
    );

    const categories = categoryData.map((item) => {

        const amount = Number(item.totalAmount || 0);

        return {
            category: item._id || "Other",
            amount,
            transactionCount: Number(item.transactionCount || 0),
            percentage:
                totalExpense > 0
                    ? Number(
                        ((amount / totalExpense) * 100).toFixed(2)
                    )
                    : 0
        };
    });

    return {
        totalExpense,
        categories
    };
};

// Recent Transactions
export const getRecentTransactions = async (userId) => {

    // Get latest 5 expenses
    const expenses = await Expense.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

    // Get latest 5 incomes
    const incomes = await Income.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

    // Add transaction type
    const formattedExpenses = expenses.map(expense => ({
        ...expense,
        transactionType: "Expense"
    }));

    const formattedIncomes = incomes.map(income => ({
        ...income,
        transactionType: "Income"
    }));

    // Merge and sort
    const transactions = [
        ...formattedExpenses,
        ...formattedIncomes
    ].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    return transactions.slice(0, 10);
};

// Financial Health Score

export const getFinancialHealth = async (userId) => {

    // =====================================================
    // 1. FETCH USER FINANCIAL DATA
    // =====================================================

    const [incomes, expenses, budgets, goals] =
        await Promise.all([

            Income.find({
                user: userId
            }).lean(),

            Expense.find({
                user: userId,
                type: "expense"
            }).lean(),

            Budget.find({
                user: userId
            }).lean(),

            Goal.find({
                user: userId
            }).lean()
        ]);


    // =====================================================
    // 2. BASIC FINANCIAL METRICS
    // =====================================================

    const totalIncome = incomes.reduce(
        (sum, item) =>
            sum + Number(item.amount || 0),
        0
    );


    const totalExpense = expenses.reduce(
        (sum, item) =>
            sum + Number(item.amount || 0),
        0
    );


    const savings =
        totalIncome - totalExpense;


    const savingsRate =
        totalIncome > 0
            ? (savings / totalIncome) * 100
            : 0;


    const expenseToIncomeRatio =
        totalIncome > 0
            ? (totalExpense / totalIncome) * 100
            : 100;


    // =====================================================
    // 3. SAVINGS SCORE
    // =====================================================

    let savingsScore = 0;


    if (savingsRate >= 50) {
        savingsScore = 100;
    } else if (savingsRate >= 40) {
        savingsScore = 90;
    } else if (savingsRate >= 30) {
        savingsScore = 80;
    } else if (savingsRate >= 20) {
        savingsScore = 70;
    } else if (savingsRate >= 10) {
        savingsScore = 60;
    } else if (savingsRate >= 0) {
        savingsScore = 40;
    } else {
        savingsScore = 10;
    }


    // =====================================================
    // 4. BUDGET SCORE
    // =====================================================

    let budgetScore = 70;

    let totalBudgetAmount = 0;
    let totalBudgetSpent = 0;
    let exceededBudgets = 0;

    const currentDate = new Date();

    const currentMonth =
        currentDate.getMonth() + 1;

    const currentYear =
        currentDate.getFullYear();


    const currentBudgets =
        budgets.filter((budget) => {

            const budgetMonth =
                Number(
                    budget.month ??
                    currentMonth
                );

            const budgetYear =
                Number(
                    budget.year ??
                    currentYear
                );

            return (
                budgetMonth === currentMonth &&
                budgetYear === currentYear
            );
        });


    for (const budget of currentBudgets) {

        const budgetAmount =
            Number(
                budget.limitAmount ??
                budget.amount ??
                0
            );


        const categoryExpenses =
            expenses.filter(
                (expense) =>
                    expense.category ===
                    budget.category
            );


        const spent =
            categoryExpenses.reduce(
                (sum, expense) =>
                    sum +
                    Number(
                        expense.amount || 0
                    ),
                0
            );


        totalBudgetAmount +=
            budgetAmount;

        totalBudgetSpent +=
            spent;


        if (
            budgetAmount > 0 &&
            spent > budgetAmount
        ) {
            exceededBudgets++;
        }
    }


    const budgetUtilization =
        totalBudgetAmount > 0
            ? (
                totalBudgetSpent /
                totalBudgetAmount
            ) * 100
            : 0;


    if (currentBudgets.length === 0) {

        // Neutral score when no budget exists
        budgetScore = 70;

    } else if (budgetUtilization <= 50) {

        budgetScore = 100;

    } else if (budgetUtilization <= 70) {

        budgetScore = 90;

    } else if (budgetUtilization <= 80) {

        budgetScore = 80;

    } else if (budgetUtilization <= 100) {

        budgetScore = 60;

    } else {

        budgetScore = 20;
    }


    // =====================================================
    // 5. GOAL PROGRESS SCORE
    // =====================================================

    let goalScore = 70;

    let averageGoalProgress = 0;


    if (goals.length > 0) {

        const goalProgressTotal =
            goals.reduce(
                (sum, goal) => {

                    const target =
                        Number(
                            goal.targetAmount || 0
                        );

                    const saved =
                        Number(
                            goal.savedAmount || 0
                        );


                    const progress =
                        target > 0
                            ? Math.min(
                                (
                                    saved /
                                    target
                                ) * 100,
                                100
                            )
                            : 0;


                    return sum + progress;
                },
                0
            );


        averageGoalProgress =
            goalProgressTotal /
            goals.length;


        if (averageGoalProgress >= 80) {

            goalScore = 100;

        } else if (averageGoalProgress >= 60) {

            goalScore = 90;

        } else if (averageGoalProgress >= 40) {

            goalScore = 75;

        } else if (averageGoalProgress >= 20) {

            goalScore = 60;

        } else {

            goalScore = 40;
        }

    }


    // =====================================================
    // 6. SPENDING SCORE
    // =====================================================

    let spendingScore = 100;


    if (expenseToIncomeRatio <= 50) {

        spendingScore = 100;

    } else if (expenseToIncomeRatio <= 60) {

        spendingScore = 90;

    } else if (expenseToIncomeRatio <= 70) {

        spendingScore = 80;

    } else if (expenseToIncomeRatio <= 80) {

        spendingScore = 70;

    } else if (expenseToIncomeRatio <= 100) {

        spendingScore = 50;

    } else {

        spendingScore = 20;
    }


    // =====================================================
    // 7. OVERSPENDING RISK SCORE
    // =====================================================

    let overspendingRiskScore = 100;


    if (exceededBudgets >= 3) {

        overspendingRiskScore = 20;

    } else if (exceededBudgets === 2) {

        overspendingRiskScore = 40;

    } else if (exceededBudgets === 1) {

        overspendingRiskScore = 65;

    } else if (
        budgetUtilization > 90
    ) {

        overspendingRiskScore = 70;

    } else {

        overspendingRiskScore = 100;
    }


    // =====================================================
    // 8. FINANCIAL STABILITY SCORE
    // =====================================================

    let stabilityScore = 70;


    if (totalIncome <= 0) {

        stabilityScore = 0;

    } else if (savings >= 0) {

        if (savingsRate >= 30) {

            stabilityScore = 100;

        } else if (savingsRate >= 20) {

            stabilityScore = 90;

        } else if (savingsRate >= 10) {

            stabilityScore = 80;

        } else {

            stabilityScore = 65;
        }

    } else {

        stabilityScore = 25;
    }


    // =====================================================
    // 9. WEIGHTED FINANCIAL HEALTH SCORE
    // =====================================================

    const healthScore = Math.round(

        (savingsScore * 0.25) +

        (budgetScore * 0.20) +

        (goalScore * 0.15) +

        (spendingScore * 0.20) +

        (overspendingRiskScore * 0.10) +

        (stabilityScore * 0.10)
    );


    // =====================================================
    // 10. HEALTH STATUS
    // =====================================================

    let status = "Poor";

    if (healthScore >= 85) {

        status = "Excellent";

    } else if (healthScore >= 70) {

        status = "Good";

    } else if (healthScore >= 50) {

        status = "Average";
    }


    // =====================================================
    // 11. RISK LEVEL
    // =====================================================

    let riskLevel = "High";


    if (healthScore >= 85) {

        riskLevel = "Low";

    } else if (healthScore >= 70) {

        riskLevel = "Moderate";

    } else if (healthScore >= 50) {

        riskLevel = "Medium";
    }


    // =====================================================
    // 12. PERSONALIZED RECOMMENDATIONS
    // =====================================================

    const recommendations = [];


    if (savingsRate < 20) {

        recommendations.push(
            "Increase your monthly savings by reducing non-essential expenses."
        );
    }


    if (budgetUtilization > 80) {

        recommendations.push(
            "Your budget utilization is high. Consider reducing spending in high-expense categories."
        );
    }


    if (exceededBudgets > 0) {

        recommendations.push(
            `${exceededBudgets} budget category${exceededBudgets > 1 ? "ies have" : " has"} exceeded the planned limit.`
        );
    }


    if (
        goals.length > 0 &&
        averageGoalProgress < 40
    ) {

        recommendations.push(
            "Your goal progress is below 40%. Consider increasing your regular contributions."
        );
    }


    if (expenseToIncomeRatio > 80) {

        recommendations.push(
            "Your expenses are high compared with your income. Review recurring and discretionary spending."
        );
    }


    if (recommendations.length === 0) {

        recommendations.push(
            "Your financial indicators are healthy. Continue maintaining your current saving and spending pattern."
        );
    }


    // =====================================================
    // 13. RESEARCH-ORIENTED OUTPUT
    // =====================================================

    return {

        healthScore,

        status,

        riskLevel,


        // Core financial metrics
        totalIncome,

        totalExpense,

        savings,

        savingsRate:
            Number(
                savingsRate.toFixed(2)
            ),


        expenseToIncomeRatio:
            Number(
                expenseToIncomeRatio.toFixed(2)
            ),


        // Individual model scores
        savingsScore,

        budgetScore,

        goalScore,

        spendingScore,

        overspendingRiskScore,

        stabilityScore,


        // Supporting analytics
        budgetUtilization:
            Number(
                budgetUtilization.toFixed(2)
            ),

        averageGoalProgress:
            Number(
                averageGoalProgress.toFixed(2)
            ),

        exceededBudgets,

        totalBudgets:
            currentBudgets.length,

        totalGoals:
            goals.length,


        // AI / intelligence layer
        recommendations
    };
};
    