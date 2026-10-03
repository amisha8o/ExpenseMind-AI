import { body } from "express-validator";

export const budgetValidator = [
    body("category")
        .trim()
        .notEmpty()
        .withMessage("Category is required"),

    body("limitAmount")
        .isFloat({ min: 0.01 })
        .withMessage("Budget limit must be greater than 0"),

    body("period")
        .optional()
        .isIn(["weekly", "monthly", "yearly"])
        .withMessage("Period must be weekly, monthly, or yearly"),

    body("month")
        .optional()
        .isInt({ min: 1, max: 12 })
        .withMessage("Month must be between 1 and 12"),

    body("year")
        .optional()
        .isInt({ min: 2000 })
        .withMessage("Year must be valid"),

    body("alertThreshold")
        .optional()
        .isInt({ min: 0, max: 100 })
        .withMessage("Alert threshold must be between 0 and 100"),
];
