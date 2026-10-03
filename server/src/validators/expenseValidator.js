import { body } from "express-validator";

export const expenseValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required"),

  body("amount")
    .isFloat({ min: 0 })
    .withMessage("Amount must be greater than 0"),

  body("category")
    .notEmpty()
    .withMessage("Category is required"),
];