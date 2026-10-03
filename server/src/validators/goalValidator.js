import { body } from "express-validator";

export const goalValidator = [
    body("title")
        .trim()
        .notEmpty()
        .withMessage("Goal title is required"),

    body("targetAmount")
        .isFloat({ min: 0.01 })
        .withMessage("Target amount must be greater than 0"),

    body("savedAmount")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Saved amount cannot be negative"),

    body("deadline")
        .optional()
        .isISO8601()
        .withMessage("Deadline must be a valid date"),

    body("category")
        .optional()
        .isString(),
];

export const contributeValidator = [
    body("amount")
        .isFloat()
        .withMessage("Amount must be a number")
        .not()
        .equals("0")
        .withMessage("Amount cannot be zero"),
];
