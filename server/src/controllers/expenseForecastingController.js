import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
    getExpenseForecast as getExpenseForecastService
} from "../services/expenseForecastingService.js";

export const getExpenseForecast = asyncHandler(
    async (req, res) => {

        const result = await getExpenseForecastService(
            req.user._id
        );

        res.status(200).json(
            new ApiResponse(
                200,
                "Expense forecasting completed successfully",
                result
            )
        );
    }
);