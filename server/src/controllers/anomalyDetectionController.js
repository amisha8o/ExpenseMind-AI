import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
    detectExpenseAnomalies
} from "../services/anomalyDetectionService.js";


export const getExpenseAnomalies = asyncHandler(
    async (req, res) => {

        const result =
            await detectExpenseAnomalies(
                req.user._id
            );

        res.status(200).json(
            new ApiResponse(
                200,
                "Expense anomaly analysis completed successfully",
                result
            )
        );
    }
);