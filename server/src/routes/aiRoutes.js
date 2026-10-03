import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {

    analyzeFinancialData

} from "../controllers/aiController.js";

const router = express.Router();

router.post(

    "/analyze",

    authMiddleware,

    analyzeFinancialData

);

export default router;