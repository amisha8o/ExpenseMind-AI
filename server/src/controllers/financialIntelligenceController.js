import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
    getFinancialIntelligence
} from "../services/financialIntelligenceService.js";


// =====================================================
// GET FINANCIAL INTELLIGENCE
// =====================================================

export const financialIntelligence =
    asyncHandler(async (req, res) => {

        const intelligence =
            await getFinancialIntelligence(
                req.user._id
            );


        res.status(200).json(

            new ApiResponse(
                200,
                "Financial Intelligence Fetched Successfully",
                intelligence
            )
        );
    });

    // =====================================================
// GET FINANCIAL HEALTH
// Uses the new Financial Intelligence Engine
// =====================================================

export const getFinancialHealth =
    asyncHandler(async (req, res) => {

        const intelligence =
            await getFinancialIntelligence(
                req.user._id
            );

        res.status(200).json(

            new ApiResponse(
                200,
                "Financial Health Calculated Successfully",
                {
                    healthScore:
                        intelligence.financialHealthScore,

                    status:
                        intelligence.financialStatus,

                    riskLevel:
                        intelligence.financialHealthScore < 40
                            ? "High"
                            : intelligence.financialHealthScore < 60
                                ? "Medium"
                                : "Low",

                    financialHealthScore:
                        intelligence.financialHealthScore,

                    financialStatus:
                        intelligence.financialStatus,

                    healthScoreBreakdown:
                        intelligence.healthScoreBreakdown,

                    scoreInterpretation:
                        intelligence.scoreInterpretation,

                    ...intelligence.summary
                }
            )
        );
    });