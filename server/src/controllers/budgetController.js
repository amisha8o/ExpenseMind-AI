import { validationResult } from "express-validator";
import Budget from "../models/Budget.js";

import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

import {
    enrichBudget,
    enrichBudgetList,
    getBudgetIntelligenceService
} from "../services/budgetService.js";


// =====================================================
// CREATE BUDGET
// =====================================================

export const createBudget = asyncHandler(
    async (req, res) => {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {

            throw new ApiError(
                400,
                "Validation Failed",
                errors.array()
            );
        }


        const exists = await Budget.findOne({

            user: req.user._id,

            category: req.body.category,

            month:
                req.body.month ??
                new Date().getMonth() + 1,

            year:
                req.body.year ??
                new Date().getFullYear()
        });


        if (exists) {

            throw new ApiError(
                409,
                "A budget for this category and month already exists"
            );
        }


        const budget = await Budget.create({

            ...req.body,

            user: req.user._id
        });


        const enriched =
            await enrichBudget(budget);


        res.status(201).json(

            new ApiResponse(
                201,
                "Budget created successfully",
                enriched
            )
        );
    }
);


// =====================================================
// GET ALL BUDGETS
// =====================================================

export const getBudgets = asyncHandler(
    async (req, res) => {

        const filter = {
            user: req.user._id
        };


        if (req.query.month) {

            filter.month =
                Number(req.query.month);
        }


        if (req.query.year) {

            filter.year =
                Number(req.query.year);
        }


        const budgets = await Budget.find(
            filter
        ).sort({
            createdAt: -1
        });


        const enriched =
            await enrichBudgetList(budgets);


        res.status(200).json(

            new ApiResponse(
                200,
                "Budgets fetched successfully",
                enriched
            )
        );
    }
);


// =====================================================
// GET SINGLE BUDGET
// =====================================================

export const getBudgetById = asyncHandler(
    async (req, res) => {

        const budget =
            await Budget.findOne({

                _id: req.params.id,

                user: req.user._id
            });


        if (!budget) {

            throw new ApiError(
                404,
                "Budget not found"
            );
        }


        const enriched =
            await enrichBudget(budget);


        res.status(200).json(

            new ApiResponse(
                200,
                "Budget fetched successfully",
                enriched
            )
        );
    }
);


// =====================================================
// UPDATE BUDGET
// =====================================================

export const updateBudget = asyncHandler(
    async (req, res) => {

        const budget =
            await Budget.findOne({

                _id: req.params.id,

                user: req.user._id
            });


        if (!budget) {

            throw new ApiError(
                404,
                "Budget not found"
            );
        }


        Object.assign(
            budget,
            req.body
        );


        await budget.save();


        const enriched =
            await enrichBudget(budget);


        res.status(200).json(

            new ApiResponse(
                200,
                "Budget updated successfully",
                enriched
            )
        );
    }
);


// =====================================================
// DELETE BUDGET
// =====================================================

export const deleteBudget = asyncHandler(
    async (req, res) => {

        const budget =
            await Budget.findOne({

                _id: req.params.id,

                user: req.user._id
            });


        if (!budget) {

            throw new ApiError(
                404,
                "Budget not found"
            );
        }


        await budget.deleteOne();


        res.status(200).json(

            new ApiResponse(
                200,
                "Budget deleted successfully"
            )
        );
    }
);


// =====================================================
// GET BUDGET SUMMARY
// =====================================================

export const getBudgetSummary = asyncHandler(
    async (req, res) => {

        const now = new Date();


        const month =
            Number(req.query.month) ||
            now.getMonth() + 1;


        const year =
            Number(req.query.year) ||
            now.getFullYear();


        const budgets =
            await Budget.find({

                user: req.user._id,

                month,

                year
            });


        const enriched =
            await enrichBudgetList(budgets);


        const totalLimit =
            enriched.reduce(
                (sum, budget) =>
                    sum +
                    Number(
                        budget.limitAmount || 0
                    ),
                0
            );


        const totalSpent =
            enriched.reduce(
                (sum, budget) =>
                    sum +
                    Number(
                        budget.spent || 0
                    ),
                0
            );


        const exceededCount =
            enriched.filter(
                (budget) =>
                    budget.status ===
                    "exceeded"
            ).length;


        const warningCount =
            enriched.filter(
                (budget) =>
                    budget.status ===
                    "warning"
            ).length;


        res.status(200).json(

            new ApiResponse(

                200,

                "Budget summary fetched successfully",

                {

                    totalLimit,

                    totalSpent,

                    totalRemaining:
                        Math.max(
                            totalLimit -
                            totalSpent,
                            0
                        ),

                    exceededCount,

                    warningCount,

                    budgets: enriched
                }
            )
        );
    }
);


// =====================================================
// GET BUDGET INTELLIGENCE
// =====================================================

export const getBudgetIntelligence =
    asyncHandler(
        async (req, res) => {

            const intelligence =
                await getBudgetIntelligenceService(
                    req.user._id
                );


            res.status(200).json(

                new ApiResponse(

                    200,

                    "Budget Intelligence Fetched Successfully",

                    intelligence
                )
            );
        }
    );