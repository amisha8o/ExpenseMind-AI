import express from "express";

import {
    getFinancialRecommendations
} from "../controllers/aiRecommendationController.js";

import authMiddleware from "../middleware/authMiddleware.js";


const router = express.Router();


router.get(
    "/",
    authMiddleware,
    getFinancialRecommendations
);


export default router;