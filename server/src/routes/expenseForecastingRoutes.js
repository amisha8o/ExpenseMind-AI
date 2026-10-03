import express from "express";

import {
    getExpenseForecast
} from "../controllers/expenseForecastingController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
    "/",
    authMiddleware,
    getExpenseForecast
);

export default router;