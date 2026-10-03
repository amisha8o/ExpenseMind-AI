import Income from "../models/Income.js";
import Expense from "../models/Expense.js";

import {
    getBudgetIntelligenceService
} from "./budgetService.js";

import {
    enrichGoalList
} from "./goalService.js";

import Goal from "../models/Goal.js";


// =====================================================
// COMBINED FINANCIAL INTELLIGENCE ENGINE
// =====================================================

export const getFinancialIntelligence =
    async (userId) => {

        // =================================================
        // 1. GET BUDGET INTELLIGENCE
        // =================================================

        const budgetIntelligence =
            await getBudgetIntelligenceService(userId);


        // =================================================
        // 2. GET GOAL INTELLIGENCE
        // =================================================

        const goals =
            await Goal.find({
                user: userId
            })
            .sort({
                createdAt: -1
            });

        const goalIntelligence =
            await enrichGoalList(goals);


        // =================================================
        // 3. GET TOTAL INCOME
        // =================================================

        const incomes =
            await Income.find({
                user: userId
            }).lean();

        const totalIncome =
            incomes.reduce(
                (sum, income) =>
                    sum +
                    Number(
                        income.amount || 0
                    ),
                0
            );


        // =================================================
        // 4. GET TOTAL EXPENSE
        // =================================================

        const expenses =
            await Expense.find({
                user: userId,
                type: "expense"
            }).lean();

        const totalExpense =
            expenses.reduce(
                (sum, expense) =>
                    sum +
                    Number(
                        expense.amount || 0
                    ),
                0
            );


        // =================================================
        // 5. SAVINGS ANALYSIS
        // =================================================

        const totalSavings =
            totalIncome -
            totalExpense;

        const savingsRate =
            totalIncome > 0
                ? Number(
                    (
                        (
                            totalSavings /
                            totalIncome
                        ) * 100
                    ).toFixed(2)
                )
                : 0;


        // =================================================
        // 6. BUDGET ANALYSIS
        // =================================================

        const budgetItems =
            budgetIntelligence.intelligence ||
            [];

        const exceededBudgets =
            budgetItems.filter(
                (item) =>
                    item.status === "Exceeded"
            );

        const warningBudgets =
            budgetItems.filter(
                (item) =>
                    item.status === "Warning"
            );


        // -------------------------------------------------
        // Current budget service supports:
        // limitAmount
        // spent
        // -------------------------------------------------

        const totalBudget =
            budgetItems.reduce(
                (sum, item) =>
                    sum +
                    Number(
                        item.limitAmount ||
                        item.budgetAmount ||
                        0
                    ),
                0
            );

        const totalBudgetSpent =
            budgetItems.reduce(
                (sum, item) =>
                    sum +
                    Number(
                        item.spent ||
                        item.spentAmount ||
                        0
                    ),
                0
            );

        const budgetUtilization =
            totalBudget > 0
                ? Number(
                    (
                        (
                            totalBudgetSpent /
                            totalBudget
                        ) * 100
                    ).toFixed(2)
                )
                : 0;


        // =================================================
        // 7. GOAL ANALYSIS
        // =================================================

        const totalGoals =
            goalIntelligence.length;

        const completedGoals =
            goalIntelligence.filter(
                (goal) =>
                    goal.status === "completed"
            ).length;

        const activeGoals =
            goalIntelligence.filter(
                (goal) =>
                    goal.status !== "completed"
            ).length;

        const totalGoalTarget =
            goalIntelligence.reduce(
                (sum, goal) =>
                    sum +
                    Number(
                        goal.target ||
                        goal.targetAmount ||
                        0
                    ),
                0
            );

        const totalGoalSaved =
            goalIntelligence.reduce(
                (sum, goal) =>
                    sum +
                    Number(
                        goal.savedAmount ||
                        0
                    ),
                0
            );

        const goalProgress =
            totalGoalTarget > 0
                ? Number(
                    (
                        (
                            totalGoalSaved /
                            totalGoalTarget
                        ) * 100
                    ).toFixed(2)
                )
                : 0;


        // =================================================
        // 8. FINANCIAL HEALTH COMPONENT SCORES
        // =================================================

        /*
         * The Financial Health Score is composed of:
         *
         * Savings Health       = 40%
         * Budget Management    = 30%
         * Goal Progress        = 20%
         * Financial Stability   = 10%
         *
         * Final Score = 0 - 100
         */


        // -------------------------------------------------
        // A. SAVINGS SCORE - 40%
        // -------------------------------------------------

        let savingsScore = 0;

        if (totalIncome > 0) {

            if (savingsRate >= 30) {

                savingsScore = 100;

            } else if (savingsRate >= 20) {

                savingsScore = 85;

            } else if (savingsRate >= 10) {

                savingsScore = 70;

            } else if (savingsRate >= 0) {

                savingsScore = 50;

            } else {

                savingsScore = 10;
            }
        }


        // -------------------------------------------------
        // B. BUDGET SCORE - 30%
        // -------------------------------------------------

        let budgetScore = 50;

        if (totalBudget > 0) {

            if (budgetUtilization <= 70) {

                budgetScore = 100;

            } else if (budgetUtilization <= 85) {

                budgetScore = 85;

            } else if (budgetUtilization <= 100) {

                budgetScore = 70;

            } else if (budgetUtilization <= 120) {

                budgetScore = 40;

            } else {

                budgetScore = 20;
            }
        }


        // -------------------------------------------------
        // C. GOAL SCORE - 20%
        // -------------------------------------------------

        let goalScore = 50;

        if (totalGoals > 0) {

            goalScore =
                Math.min(
                    100,
                    Math.max(
                        0,
                        goalProgress
                    )
                );
        }


        // -------------------------------------------------
        // D. FINANCIAL STABILITY SCORE - 10%
        // -------------------------------------------------

        let stabilityScore = 70;

        if (totalIncome === 0) {

            stabilityScore = 20;

        } else if (totalSavings < 0) {

            stabilityScore = 20;

        } else if (savingsRate < 10) {

            stabilityScore = 50;

        } else if (savingsRate >= 30) {

            stabilityScore = 100;

        } else {

            stabilityScore = 75;
        }


        // =================================================
        // 9. FINAL FINANCIAL HEALTH SCORE
        // =================================================

        const financialHealthScore =
            Math.round(

                (
                    savingsScore * 0.40
                ) +

                (
                    budgetScore * 0.30
                ) +

                (
                    goalScore * 0.20
                ) +

                (
                    stabilityScore * 0.10
                )

            );


        // =================================================
        // 10. FINANCIAL STATUS
        // =================================================

        let financialStatus =
            "Stable";


        if (totalIncome === 0) {

            financialStatus =
                "No Income Data";

        } else if (
            financialHealthScore >= 80
        ) {

            financialStatus =
                "Healthy";

        } else if (
            financialHealthScore >= 60
        ) {

            financialStatus =
                "Stable";

        } else if (
            financialHealthScore >= 40
        ) {

            financialStatus =
                "Needs Attention";

        } else {

            financialStatus =
                "At Risk";
        }


        // =================================================
        // 11. SCORE INTERPRETATION
        // =================================================

        let scoreInterpretation =
            "Financial condition requires attention.";


        if (
            financialHealthScore >= 80
        ) {

            scoreInterpretation =
                "Strong financial health with good savings, budget control and financial planning.";

        } else if (
            financialHealthScore >= 60
        ) {

            scoreInterpretation =
                "Generally stable financial condition with some areas that can be improved.";

        } else if (
            financialHealthScore >= 40
        ) {

            scoreInterpretation =
                "Financial condition needs attention, particularly in savings or budget management.";

        } else {

            scoreInterpretation =
                "Financial condition indicates significant pressure and requires corrective action.";
        }


        // =================================================
        // 12. GENERATE FINANCIAL INSIGHTS
        // =================================================

        const insights = [];


        if (totalIncome === 0) {

            insights.push(
                "Add income data to generate personalized financial insights."
            );
        }


        if (savingsRate >= 30) {

            insights.push(
                `Your current savings rate is ${savingsRate}%, indicating a strong saving pattern.`
            );

        } else if (
            totalIncome > 0 &&
            savingsRate < 30
        ) {

            insights.push(
                `Your current savings rate is ${savingsRate}%. Consider increasing monthly savings.`
            );
        }


        if (totalSavings < 0) {

            insights.push(
                "Your expenses currently exceed your recorded income."
            );
        }


        if (exceededBudgets.length > 0) {

            insights.push(
                `${exceededBudgets.length} budget category(s) have exceeded their planned limits.`
            );
        }


        if (warningBudgets.length > 0) {

            insights.push(
                `${warningBudgets.length} budget category(s) are approaching their limits.`
            );
        }


        if (
            totalGoals > 0 &&
            goalProgress >= 75
        ) {

            insights.push(
                `Your overall goal progress is ${goalProgress}%. You are making strong progress toward your financial goals.`
            );

        } else if (
            totalGoals > 0 &&
            goalProgress < 75
        ) {

            insights.push(
                `Your overall goal progress is ${goalProgress}%. Consider increasing contributions toward your financial goals.`
            );
        }


        if (totalGoals === 0) {

            insights.push(
                "Create a financial goal to improve long-term savings planning."
            );
        }


        // =================================================
        // 13. RETURN FINANCIAL INTELLIGENCE
        // =================================================

        return {

            financialStatus,

            financialHealthScore,

            scoreInterpretation,


            // -------------------------------------------------
            // COMPONENT SCORES
            // -------------------------------------------------

            healthScoreBreakdown: {

                savingsScore: {
                    score: savingsScore,
                    weight: 40,
                    weightedScore:
                        Number(
                            (
                                savingsScore *
                                0.40
                            ).toFixed(2)
                        )
                },

                budgetScore: {
                    score: budgetScore,
                    weight: 30,
                    weightedScore:
                        Number(
                            (
                                budgetScore *
                                0.30
                            ).toFixed(2)
                        )
                },

                goalScore: {
                    score: goalScore,
                    weight: 20,
                    weightedScore:
                        Number(
                            (
                                goalScore *
                                0.20
                            ).toFixed(2)
                        )
                },

                stabilityScore: {
                    score: stabilityScore,
                    weight: 10,
                    weightedScore:
                        Number(
                            (
                                stabilityScore *
                                0.10
                            ).toFixed(2)
                        )
                }
            },


            // -------------------------------------------------
            // SUMMARY
            // -------------------------------------------------

            summary: {

                totalIncome,

                totalExpense,

                totalSavings,

                savingsRate

            },


            // -------------------------------------------------
            // BUDGET INTELLIGENCE
            // -------------------------------------------------

            budgetIntelligence: {

                totalBudgets:
                    budgetIntelligence.totalBudgets,

                totalBudget,

                totalBudgetSpent,

                budgetUtilization,

                exceededBudgets:
                    exceededBudgets.length,

                warningBudgets:
                    warningBudgets.length,

                intelligence:
                    budgetItems

            },


            // -------------------------------------------------
            // GOAL INTELLIGENCE
            // -------------------------------------------------

            goalIntelligence: {

                totalGoals,

                activeGoals,

                completedGoals,

                totalGoalTarget,

                totalGoalSaved,

                goalProgress,

                goals:
                    goalIntelligence

            },


            // -------------------------------------------------
            // INSIGHTS
            // -------------------------------------------------

            insights

        };
    };