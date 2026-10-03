import mongoose from "mongoose";
import dotenv from "dotenv";

import {
    evaluateExpenseForecast
} from "./forecastEvaluationService.js";

dotenv.config();

const RUNS = 5;

function calculateMean(values) {
    if (!values.length) return 0;

    return (
        values.reduce(
            (sum, value) => sum + value,
            0
        ) / values.length
    );
}

function calculateStandardDeviation(values) {
    if (values.length <= 1) return 0;

    const mean =
        calculateMean(values);

    const variance =
        values.reduce(
            (sum, value) =>
                sum +
                Math.pow(
                    value - mean,
                    2
                ),
            0
        ) / values.length;

    return Math.sqrt(variance);
}

function round(value) {
    return Number(
        value.toFixed(2)
    );
}

async function runExperiment() {
    try {

        await mongoose.connect(
            process.env.MONGO_URI
        );

        console.log(
            "\nMongoDB connected."
        );

        const results = [];

        console.log(
            "\n========================================"
        );

        console.log(
            "FORECAST REPEATABILITY EXPERIMENT"
        );

        console.log(
            "========================================"
        );

        for (
            let run = 1;
            run <= RUNS;
            run++
        ) {

            const result =
                await evaluateExpenseForecast();

            const rawMAE =
                result.results.rawTrend.MAE;

            const rawRMSE =
                result.results.rawTrend.RMSE;

            const anomalyAwareMAE =
                result.results
                    .anomalyAwareTrend.MAE;

            const anomalyAwareRMSE =
                result.results
                    .anomalyAwareTrend.RMSE;

            const maeImprovement =
                result.results
                    .improvement.MAE;

            const rmseImprovement =
                result.results
                    .improvement.RMSE;

            const detectedTrainingAnomalies =
                result.anomalyDetection
                    .detectedTrainingAnomalies;

            results.push({
                run,

                rawMAE,

                rawRMSE,

                anomalyAwareMAE,

                anomalyAwareRMSE,

                maeImprovement,

                rmseImprovement,

                detectedTrainingAnomalies
            });

            console.log(
                `\nRun ${run}`
            );

            console.log(
                `Raw MAE: ₹${rawMAE}`
            );

            console.log(
                `Raw RMSE: ₹${rawRMSE}`
            );

            console.log(
                `Anomaly-Aware MAE: ₹${anomalyAwareMAE}`
            );

            console.log(
                `Anomaly-Aware RMSE: ₹${anomalyAwareRMSE}`
            );

            console.log(
                `MAE Improvement: ${maeImprovement}%`
            );

            console.log(
                `RMSE Improvement: ${rmseImprovement}%`
            );

            console.log(
                `Detected Training Anomalies: ${detectedTrainingAnomalies}`
            );
        }

        /*
         * ==========================================
         * Aggregate results
         * ==========================================
         */

        const rawMAEs =
            results.map(
                result => result.rawMAE
            );

        const rawRMSEs =
            results.map(
                result => result.rawRMSE
            );

        const anomalyAwareMAEs =
            results.map(
                result =>
                    result.anomalyAwareMAE
            );

        const anomalyAwareRMSEs =
            results.map(
                result =>
                    result.anomalyAwareRMSE
            );

        const maeImprovements =
            results.map(
                result =>
                    result.maeImprovement
            );

        const rmseImprovements =
            results.map(
                result =>
                    result.rmseImprovement
            );

        const detectedAnomalies =
            results.map(
                result =>
                    result.detectedTrainingAnomalies
            );

        const summary = {
            rawTrend: {
                MAE: {
                    mean:
                        round(
                            calculateMean(
                                rawMAEs
                            )
                        ),

                    standardDeviation:
                        round(
                            calculateStandardDeviation(
                                rawMAEs
                            )
                        )
                },

                RMSE: {
                    mean:
                        round(
                            calculateMean(
                                rawRMSEs
                            )
                        ),

                    standardDeviation:
                        round(
                            calculateStandardDeviation(
                                rawRMSEs
                            )
                        )
                }
            },

            anomalyAwareTrend: {
                MAE: {
                    mean:
                        round(
                            calculateMean(
                                anomalyAwareMAEs
                            )
                        ),

                    standardDeviation:
                        round(
                            calculateStandardDeviation(
                                anomalyAwareMAEs
                            )
                        )
                },

                RMSE: {
                    mean:
                        round(
                            calculateMean(
                                anomalyAwareRMSEs
                            )
                        ),

                    standardDeviation:
                        round(
                            calculateStandardDeviation(
                                anomalyAwareRMSEs
                            )
                        )
                }
            },

            improvement: {
                MAE: {
                    mean:
                        round(
                            calculateMean(
                                maeImprovements
                            )
                        ),

                    standardDeviation:
                        round(
                            calculateStandardDeviation(
                                maeImprovements
                            )
                        )
                },

                RMSE: {
                    mean:
                        round(
                            calculateMean(
                                rmseImprovements
                            )
                        ),

                    standardDeviation:
                        round(
                            calculateStandardDeviation(
                                rmseImprovements
                            )
                        )
                }
            },

            detectedTrainingAnomalies: {
                mean:
                    round(
                        calculateMean(
                            detectedAnomalies
                        )
                    ),

                standardDeviation:
                    round(
                        calculateStandardDeviation(
                            detectedAnomalies
                        )
                    )
            }
        };

        /*
         * ==========================================
         * Console output
         * ==========================================
         */

        console.log(
            "\n========================================"
        );

        console.log(
            "PER-RUN RESULTS"
        );

        console.log(
            "========================================"
        );

        console.table(
            results
        );

        console.log(
            "\n========================================"
        );

        console.log(
            "MEAN ± STANDARD DEVIATION"
        );

        console.log(
            "========================================"
        );

        console.log(
            JSON.stringify(
                summary,
                null,
                2
            )
        );

        /*
         * ==========================================
         * Research interpretation data
         * ==========================================
         */

        const maeMean =
            summary.improvement.MAE.mean;

        const rmseMean =
            summary.improvement.RMSE.mean;

        console.log(
            "\n========================================"
        );

        console.log(
            "RESEARCH SUMMARY"
        );

        console.log(
            "========================================"
        );

        if (maeMean > 0) {

            console.log(
                `Average MAE change: ${maeMean}% improvement`
            );

        } else {

            console.log(
                `Average MAE change: ${Math.abs(maeMean)}% increase`
            );
        }

        if (rmseMean > 0) {

            console.log(
                `Average RMSE change: ${rmseMean}% improvement`
            );

        } else {

            console.log(
                `Average RMSE change: ${Math.abs(rmseMean)}% increase`
            );
        }

        console.log(
            "\nExperiment completed successfully."
        );

        await mongoose.disconnect();

    } catch (error) {

        console.error(
            "\nRepeatability experiment failed:"
        );

        console.error(error);

        await mongoose.disconnect();

        process.exit(1);
    }
}

runExperiment();