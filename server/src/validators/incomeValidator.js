import { body } from "express-validator";

export const incomeValidator = [

    body("source")
        .trim()
        .notEmpty()
        .withMessage("Income source is required"),

    body("amount")
        .isFloat({ min: 0 })
        .withMessage("Amount must be greater than zero"),

    body("category")
        .notEmpty()
        .withMessage("Category is required"),
];