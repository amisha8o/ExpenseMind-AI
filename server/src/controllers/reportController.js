import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { buildReport } from "../services/reportService.js";

// Get Report (JSON) — supports ?startDate=&endDate= (ISO strings)
export const getReport = asyncHandler(async (req, res) => {

    const { startDate, endDate } = req.query;

    if (startDate && isNaN(Date.parse(startDate))) {
        throw new ApiError(400, "Invalid startDate");
    }
    if (endDate && isNaN(Date.parse(endDate))) {
        throw new ApiError(400, "Invalid endDate");
    }

    const report = await buildReport(req.user._id, startDate, endDate);

    res.status(200).json(
        new ApiResponse(200, "Report generated successfully", report)
    );
});

// Export Report as CSV
export const exportReportCsv = asyncHandler(async (req, res) => {

    const { startDate, endDate } = req.query;
    const report = await buildReport(req.user._id, startDate, endDate);

    const rows = [
        ["Type", "Title", "Category", "Amount", "Date"],
        ...report.incomes.map((i) => [
            "Income",
            i.source || i.title || "",
            i.category || "",
            i.amount,
            new Date(i.incomeDate).toISOString().split("T")[0],
        ]),
        ...report.expenses.map((e) => [
            "Expense",
            e.title || "",
            e.category || "",
            e.amount,
            new Date(e.expenseDate).toISOString().split("T")[0],
        ]),
    ];

    const csv = rows
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        .join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="report-${Date.now()}.csv"`);
    res.status(200).send(csv);
});
