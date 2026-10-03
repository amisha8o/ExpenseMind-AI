import express from "express";

import {
    getExpenseAnomalies
} from "../controllers/anomalyDetectionController.js";

import authMiddleware from "../middleware/authMiddleware.js";


const router = express.Router();


router.get(
    "/expenses",
    authMiddleware,
    getExpenseAnomalies
);


export default router;