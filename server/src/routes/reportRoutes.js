import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
    getReport,
    exportReportCsv,
} from "../controllers/reportController.js";

const router = express.Router();

router.get(
    "/",
    authMiddleware,
    getReport
);

router.get(
    "/export/csv",
    authMiddleware,
    exportReportCsv
);

export default router;
