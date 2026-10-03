import { validationResult } from "express-validator";
import Income from "../models/Income.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// Add Income
export const addIncome = asyncHandler(async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        throw new ApiError(400, "Validation Failed", errors.array());
    }

    const income = await Income.create({
        ...req.body,
        user: req.user._id,
    });

    res.status(201).json(
        new ApiResponse(
            201,
            "Income Added Successfully",
            income
        )
    );
});

// Get All Income
export const getIncome = asyncHandler(async (req, res) => {

    const incomes = await Income.find({
        user: req.user._id,
    }).sort({ incomeDate: -1 });

    res.status(200).json(
        new ApiResponse(
            200,
            "Income fetched successfully",
            incomes
        )
    );
});


// Get Single Income
export const getIncomeById = asyncHandler(async (req, res) => {

    const income = await Income.findOne({
        _id: req.params.id,
        user: req.user._id,
    });

    if (!income) {
        throw new ApiError(404, "Income not found");
    }

    res.status(200).json(
        new ApiResponse(
            200,
            "Income fetched successfully",
            income
        )
    );
});

// Update Income
export const updateIncome = asyncHandler(async (req, res) => {

    const income = await Income.findOne({
        _id: req.params.id,
        user: req.user._id,
    });

    if (!income) {
        throw new ApiError(404, "Income not found");
    }

    Object.assign(income, req.body);

    await income.save();

    res.status(200).json(
        new ApiResponse(
            200,
            "Income updated successfully",
            income
        )
    );
});

// Delete Income
export const deleteIncome = asyncHandler(async (req, res) => {

    const income = await Income.findOne({
        _id: req.params.id,
        user: req.user._id,
    });

    if (!income) {
        throw new ApiError(404, "Income not found");
    }

    await income.deleteOne();

    res.status(200).json(
        new ApiResponse(
            200,
            "Income deleted successfully"
        )
    );
});