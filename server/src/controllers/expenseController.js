import { validationResult } from "express-validator";
import Expense from "../models/Expense.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// Add Expense
export const addExpense = asyncHandler(async (req, res) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new ApiError(400, "Validation Failed", errors.array());
  }

  const expense = await Expense.create({
    ...req.body,
    user: req.user._id,
  });

  res.status(201).json(
    new ApiResponse(
      201,
      "Expense Added Successfully",
      expense
    )
  );
});

// Get All Expenses
export const getExpenses = asyncHandler(async (req, res) => {

  const expenses = await Expense.find({
    user: req.user._id,
  }).sort({ expenseDate: -1 });

  res.status(200).json(
    new ApiResponse(
      200,
      "Expenses Fetched Successfully",
      expenses
    )
  );
});

// Get Single Expense
export const getExpenseById = asyncHandler(async (req, res) => {

    const expense = await Expense.findOne({
        _id: req.params.id,
        user: req.user._id,
    });

    if (!expense) {
        throw new ApiError(404, "Expense not found");
    }

    res.status(200).json(
        new ApiResponse(
            200,
            "Expense fetched successfully",
            expense
        )
    );
});


// Update Expense
export const updateExpense = asyncHandler(async (req, res) => {

    const expense = await Expense.findOne({
        _id: req.params.id,
        user: req.user._id,
    });

    if (!expense) {
        throw new ApiError(404, "Expense not found");
    }

    Object.assign(expense, req.body);

    await expense.save();

    res.status(200).json(
        new ApiResponse(
            200,
            "Expense updated successfully",
            expense
        )
    );
});

// Delete Expense
export const deleteExpense = asyncHandler(async (req, res) => {

    const expense = await Expense.findOne({
        _id: req.params.id,
        user: req.user._id,
    });

    if (!expense) {
        throw new ApiError(404, "Expense not found");
    }

    await expense.deleteOne();

    res.status(200).json(
        new ApiResponse(
            200,
            "Expense deleted successfully"
        )
    );
});