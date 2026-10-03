import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// Update Profile (name, email, currency, aiSensitivity, avatar)
export const updateProfile = asyncHandler(async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new ApiError(400, "Validation Failed", errors.array());
    }

    const allowedFields = ["fullName", "email", "currency", "aiSensitivity", "avatar"];
    const updates = {};

    for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
            updates[field] = req.body[field];
        }
    }

    if (updates.email) {
        const existing = await User.findOne({ email: updates.email, _id: { $ne: req.user._id } });
        if (existing) {
            throw new ApiError(409, "Email already in use by another account");
        }
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
        new: true,
        runValidators: true,
    });

    res.status(200).json(
        new ApiResponse(200, "Profile updated successfully", user)
    );
});

// Change Password
export const changePassword = asyncHandler(async (req, res) => {

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        throw new ApiError(400, "Current and new password are required");
    }

    if (newPassword.length < 6) {
        throw new ApiError(400, "New password must be at least 6 characters");
    }

    const user = await User.findById(req.user._id).select("+password");

    const isCorrect = await user.comparePassword(currentPassword);
    if (!isCorrect) {
        throw new ApiError(401, "Current password is incorrect");
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json(
        new ApiResponse(200, "Password changed successfully")
    );
});

// Delete Account
export const deleteAccount = asyncHandler(async (req, res) => {

    await User.findByIdAndDelete(req.user._id);

    res.status(200).json(
        new ApiResponse(200, "Account deleted successfully")
    );
});
