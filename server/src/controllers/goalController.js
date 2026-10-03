import { validationResult } from "express-validator";
import Goal from "../models/Goal.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

import {
    enrichGoal,
    enrichGoalList
} from "../services/goalService.js";


// =====================================================
// CREATE GOAL
// =====================================================

export const createGoal = asyncHandler(async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        throw new ApiError(
            400,
            "Validation Failed",
            errors.array()
        );
    }

    const goal = await Goal.create({
        ...req.body,
        user: req.user._id,
    });

    const enrichedGoal =
        await enrichGoal(goal);

    res.status(201).json(
        new ApiResponse(
            201,
            "Goal created successfully",
            enrichedGoal
        )
    );
});


// =====================================================
// GET ALL GOALS
// =====================================================

export const getGoals = asyncHandler(async (req, res) => {

    const filter = {
        user: req.user._id
    };

    if (req.query.status) {
        filter.status = req.query.status;
    }

    const goals = await Goal.find(filter)
        .sort({ createdAt: -1 });

    const enrichedGoals =
        await enrichGoalList(goals);

    res.status(200).json(
        new ApiResponse(
            200,
            "Goals fetched successfully",
            enrichedGoals
        )
    );
});

// =====================================================
// GET GOAL SUMMARY
// =====================================================

export const getGoalSummary = asyncHandler(async (req, res) => {

    const goals = await Goal.find({
        user: req.user._id
    }).lean();


    let totalTarget = 0;
    let totalSaved = 0;

    let completedGoals = 0;
    let activeGoals = 0;
    let overdueGoals = 0;


    const today = new Date();


    goals.forEach((goal) => {

        // Goal model uses targetAmount
        const targetAmount = Number(
            goal.targetAmount ?? 0
        );

        const savedAmount = Number(
            goal.savedAmount ?? 0
        );


        totalTarget += targetAmount;
        totalSaved += savedAmount;


        if (goal.status === "completed") {

            completedGoals++;

        } else if (goal.status === "active") {

            activeGoals++;

        }


        if (
            goal.deadline &&
            new Date(goal.deadline) < today &&
            goal.status !== "completed" &&
            goal.status !== "abandoned"
        ) {

            overdueGoals++;

        }

    });


    const remainingAmount = Math.max(
        totalTarget - totalSaved,
        0
    );


    const overallProgress =
        totalTarget > 0
            ? Number(
                (
                    (totalSaved / totalTarget) *
                    100
                ).toFixed(2)
            )
            : 0;


    res.status(200).json(

        new ApiResponse(

            200,

            "Goal summary fetched successfully",

            {
                totalGoals: goals.length,

                activeGoals,

                completedGoals,

                overdueGoals,

                totalTarget,

                totalSaved,

                remainingAmount,

                overallProgress
            }
        )
    );
});



// =====================================================
// GET SINGLE GOAL
// =====================================================

export const getGoalById = asyncHandler(async (req, res) => {

    const goal = await Goal.findOne({
        _id: req.params.id,
        user: req.user._id,
    });


    if (!goal) {
        throw new ApiError(
            404,
            "Goal not found"
        );
    }


    const enrichedGoal =
        await enrichGoal(goal);


    res.status(200).json(
        new ApiResponse(
            200,
            "Goal fetched successfully",
            enrichedGoal
        )
    );
});


// =====================================================
// UPDATE GOAL
// =====================================================
// title, target, deadline, category, notes

export const updateGoal = asyncHandler(async (req, res) => {

    const goal = await Goal.findOne({
        _id: req.params.id,
        user: req.user._id,
    });


    if (!goal) {
        throw new ApiError(
            404,
            "Goal not found"
        );
    }


    Object.assign(
        goal,
        req.body
    );


    await goal.save();


    const enrichedGoal =
        await enrichGoal(goal);


    res.status(200).json(
        new ApiResponse(
            200,
            "Goal updated successfully",
            enrichedGoal
        )
    );
});


// =====================================================
// ADD / WITHDRAW FUNDS
// =====================================================

export const contributeToGoal =
    asyncHandler(async (req, res) => {

        const { amount } = req.body;


        if (
            typeof amount !== "number" ||
            amount === 0
        ) {
            throw new ApiError(
                400,
                "A non-zero numeric amount is required"
            );
        }


        const goal = await Goal.findOne({
            _id: req.params.id,
            user: req.user._id,
        });


        if (!goal) {
            throw new ApiError(
                404,
                "Goal not found"
            );
        }


        goal.savedAmount =
            Math.max(
                Number(goal.savedAmount || 0) +
                amount,
                0
            );


        await goal.save();


        const enrichedGoal =
            await enrichGoal(goal);


        res.status(200).json(
            new ApiResponse(
                200,
                "Goal contribution recorded",
                enrichedGoal
            )
        );
    });


// =====================================================
// DELETE GOAL
// =====================================================

export const deleteGoal = asyncHandler(async (req, res) => {

    const goal = await Goal.findOne({
        _id: req.params.id,
        user: req.user._id,
    });


    if (!goal) {
        throw new ApiError(
            404,
            "Goal not found"
        );
    }


    await goal.deleteOne();


    res.status(200).json(
        new ApiResponse(
            200,
            "Goal deleted successfully"
        )
    );
});