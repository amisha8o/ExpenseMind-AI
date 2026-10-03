import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
    generateFinancialRecommendations
} from "../services/aiRecommendationService.js";


export const getFinancialRecommendations = asyncHandler(
    async (req, res) => {

        const result =
            await generateFinancialRecommendations(
                req.user._id
            );

        res.status(200).json(
            new ApiResponse(
                200,
                "Personalized financial recommendations generated successfully",
                result
            )
        );
    }
);