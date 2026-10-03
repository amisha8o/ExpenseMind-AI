import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middleware/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import incomeRoutes from "./routes/incomeRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import financialIntelligenceRoutes from "./routes/financialIntelligenceRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import aiRecommendationRoutes
    from "./routes/aiRecommendationRoutes.js";

const app = express();

/*
|--------------------------------------------------------------------------
| Middlewares
|--------------------------------------------------------------------------
*/

app.use(helmet());

// Comma-separated list of allowed origins, e.g. CLIENT_URL="http://localhost:5173,https://yourapp.com"
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow non-browser requests (no Origin header, e.g. curl/Postman/server-to-server)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error(`CORS: origin "${origin}" is not allowed`));
    },
    credentials: true,
}));

app.use(morgan("dev"));

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

app.use(cookieParser());

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "AI Finance Management API Running 🚀"
    });
});

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        status: "Healthy",
        serverTime: new Date()
    });
});
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/income", incomeRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use(
    "/api/financial-intelligence",
    financialIntelligenceRoutes
);
app.use("/api/reports", reportRoutes);
app.use(
    "/api/recommendations",
    aiRecommendationRoutes
);

app.use(errorMiddleware);
export default app;


