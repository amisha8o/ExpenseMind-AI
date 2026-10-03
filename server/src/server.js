import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";

import financialIntelligenceRoutes from "./routes/financialIntelligenceRoutes.js";
import anomalyDetectionRoutes from "./routes/anomalyDetectionRoutes.js";
import expenseForecastingRoutes from "./routes/expenseForecastingRoutes.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {

    await connectDB();

    app.use(
        "/api/financial-intelligence",
        financialIntelligenceRoutes
    );

    app.use(
        "/api/anomalies",
        anomalyDetectionRoutes
    );
    app.use("/api/forecast", expenseForecastingRoutes);

    app.listen(PORT, () => {

        console.log("=================================");
        console.log(`🚀 Server Running`);
        console.log(`🌍 http://localhost:${PORT}`);
        console.log(`Environment : ${process.env.NODE_ENV}`);
        console.log("=================================");

    });
};

startServer();