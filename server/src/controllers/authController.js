import { validationResult } from "express-validator";
import crypto from "crypto";
import User from "../models/User.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import generateToken from "../utils/generateToken.js";
import { sendPasswordResetEmail } from "../services/emailService.js";

// Register User
export const register = asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        throw new ApiError(400, "Validation Failed", errors.array());
    }

    const { fullName, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new ApiError(409, "User already exists");
    }

    const user = await User.create({
        fullName,
        email,
        password,
    });

    const token = generateToken(user._id);

    res.status(201).json(
        new ApiResponse(201, "User Registered Successfully", {
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
            },
        })
    );
});

// Login User
export const login = asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        throw new ApiError(400, "Validation Failed", errors.array());
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        throw new ApiError(401, "Invalid Email or Password");
    }

    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid Email or Password");
    }

    const token = generateToken(user._id);

    res.status(200).json(
        new ApiResponse(200, "Login Successful", {
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
            },
        })
    );
});

// Get Profile
export const profile = asyncHandler(async (req, res) => {
    res.status(200).json(
        new ApiResponse(
            200,
            "Profile Fetched Successfully",
            req.user
        )
    );
});

// Forgot Password
export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({ email }).select(
        "+resetPasswordToken +resetPasswordExpire"
    );

    // Do not reveal whether the email exists
    if (!user) {
        return res.status(200).json(
            new ApiResponse(
                200,
                "If an account exists with this email, a password reset link has been sent."
            )
        );
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Store only hashed token in database
    user.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    // Token expires after 15 minutes
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    // Frontend reset page
    const clientUrl =
        process.env.CLIENT_URL || "http://localhost:5173";

    const resetUrl =
        `${clientUrl}/reset-password/${resetToken}`;

    await sendPasswordResetEmail(
        user.email,
        resetUrl
    );

    res.status(200).json(
        new ApiResponse(
            200,
            "If an account exists with this email, a password reset link has been sent."
        )
    );
});

// Reset Password
export const resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) {
        throw new ApiError(400, "Reset token is required");
    }

    if (!password || password.length < 6) {
        throw new ApiError(
            400,
            "Password must be at least 6 characters"
        );
    }

    // Hash token received from URL
    const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    // Find user with valid token and expiry
    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() },
    }).select("+password +resetPasswordToken +resetPasswordExpire");

    if (!user) {
        throw new ApiError(
            400,
            "Reset token is invalid or has expired"
        );
    }

    // Hash the new password using the same User model logic
    user.password = password;

    // Generate password hash manually if User model uses bcrypt pre-save
    const bcrypt = await import("bcryptjs");

    const hashedPassword = await bcrypt.default.hash(
        password,
        12
    );

    // Update only password and reset-token fields
    await User.updateOne(
        { _id: user._id },
        {
            $set: {
                password: hashedPassword,
            },
            $unset: {
                resetPasswordToken: "",
                resetPasswordExpire: "",
            },
        }
    );

    res.status(200).json(
        new ApiResponse(
            200,
            "Password Reset Successful. You can now login."
        )
    );
});
