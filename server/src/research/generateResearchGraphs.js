import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --------------------------------------------------
// PATHS
// --------------------------------------------------

const resultsDir = path.resolve(
    __dirname,
    "results"
);

const resultsPath = path.resolve(
    resultsDir,
    "FINAL_RESEARCH_RESULTS.json"
);

const graphsDir = path.resolve(
    resultsDir,
    "graphs"
);

// --------------------------------------------------
// LOAD LOCKED RESULTS
// --------------------------------------------------

if (!fs.existsSync(resultsPath)) {
    throw new Error(
        `FINAL_RESEARCH_RESULTS.json not found:\n${resultsPath}`
    );
}

const lockedResults = JSON.parse(
    fs.readFileSync(resultsPath, "utf8")
);

console.log("==============================================");
console.log("LOCKED RESEARCH RESULTS LOADED");
console.log("==============================================");
console.log(
    "inventedValues:",
    lockedResults.inventedValues
);

// --------------------------------------------------
// SAFETY LOCK
// --------------------------------------------------

if (lockedResults.inventedValues === true) {
    throw new Error(
        "SAFETY STOP: FINAL_RESEARCH_RESULTS.json contains invented values."
    );
}

if (lockedResults.resultsStatus !== "LOCKED_FROM_SAVED_RESEARCH_OUTPUTS") {
    throw new Error(
        "SAFETY STOP: Research results are not marked as locked."
    );
}

fs.mkdirSync(graphsDir, { recursive: true });

// --------------------------------------------------
// CHART SETUP
// --------------------------------------------------

const width = 1200;
const height = 700;

const chartJSNodeCanvas =
    new ChartJSNodeCanvas({
        width,
        height,
        backgroundColour: "white"
    });

// --------------------------------------------------
// HELPER
// --------------------------------------------------

async function saveChart(
    filename,
    configuration
) {
    const buffer =
        await chartJSNodeCanvas.renderToBuffer(
            configuration
        );

    const outputPath =
        path.join(graphsDir, filename);

    fs.writeFileSync(
        outputPath,
        buffer
    );

    console.log(
        `Created: ${filename}`
    );
}

// ==================================================
// FIGURE 1
// ANOMALY DETECTION F1-SCORE COMPARISON
// ==================================================

const anomaly =
    lockedResults.anomalyDetection;

await saveChart(
    "Figure_1_Anomaly_Detection_F1_Comparison.png",
    {
        type: "bar",

        data: {
            labels: [
                "Z-Score",
                "Isolation Forest",
                "Hybrid"
            ],

            datasets: [
                {
                    label: "F1-Score",

                    data: [
                        anomaly.zScore.f1Score,
                        anomaly.isolationForest.f1Score,
                        anomaly.hybrid.f1Score
                    ]
                }
            ]
        },

        options: {
            responsive: false,

            plugins: {
                title: {
                    display: true,
                    text:
                        "Figure 1. Anomaly Detection F1-Score Comparison",
                    font: {
                        size: 22
                    }
                },

                legend: {
                    position: "top"
                }
            },

            scales: {
                y: {
                    beginAtZero: true,
                    max: 1,

                    title: {
                        display: true,
                        text: "F1-Score"
                    }
                },

                x: {
                    title: {
                        display: true,
                        text: "Detection Model"
                    }
                }
            }
        }
    }
);

// ==================================================
// FIGURE 2
// THRESHOLD SENSITIVITY
// ==================================================

const thresholdResults =
    lockedResults.thresholdSensitivity;

if (
    !Array.isArray(thresholdResults) ||
    thresholdResults.length === 0
) {
    throw new Error(
        "Threshold sensitivity results are missing."
    );
}

await saveChart(
    "Figure_2_Threshold_Sensitivity.png",
    {
        type: "line",

        data: {
            labels:
                thresholdResults.map(
                    item => item.threshold
                ),

            datasets: [
                {
                    label: "F1-Score",

                    data:
                        thresholdResults.map(
                            item => item.f1Score
                        ),

                    tension: 0.2
                }
            ]
        },

        options: {
            responsive: false,

            plugins: {
                title: {
                    display: true,
                    text:
                        "Figure 2. Isolation Forest Threshold Sensitivity",
                    font: {
                        size: 22
                    }
                },

                legend: {
                    position: "top"
                }
            },

            scales: {
                y: {
                    beginAtZero: true,
                    max: 1,

                    title: {
                        display: true,
                        text: "F1-Score"
                    }
                },

                x: {
                    title: {
                        display: true,
                        text:
                            "Isolation Forest Threshold"
                    }
                }
            }
        }
    }
);

// ==================================================
// FIGURE 3
// FORECASTING MAE COMPARISON
// ==================================================

const forecasting =
    lockedResults.forecasting;

const rawForecast =
    forecasting.rawForecast;

const anomalyAwareForecast =
    forecasting.anomalyAwareForecast;

await saveChart(
    "Figure_3_Forecasting_MAE_Comparison.png",
    {
        type: "bar",

        data: {
            labels: [
                rawForecast.model,
                anomalyAwareForecast.model
            ],

            datasets: [
                {
                    label: "MAE (INR)",

                    data: [
                        rawForecast.MAE,
                        anomalyAwareForecast.MAE
                    ]
                }
            ]
        },

        options: {
            responsive: false,

            plugins: {
                title: {
                    display: true,
                    text:
                        "Figure 3. Forecasting MAE Comparison",
                    font: {
                        size: 22
                    }
                },

                legend: {
                    position: "top"
                }
            },

            scales: {
                y: {
                    beginAtZero: true,

                    title: {
                        display: true,
                        text:
                            "Mean Absolute Error (INR)"
                    }
                },

                x: {
                    title: {
                        display: true,
                        text:
                            "Forecasting Model"
                    }
                }
            }
        }
    }
);

// ==================================================
// FIGURE 4
// FORECASTING RMSE COMPARISON
// ==================================================

await saveChart(
    "Figure_4_Forecasting_RMSE_Comparison.png",
    {
        type: "bar",

        data: {
            labels: [
                rawForecast.model,
                anomalyAwareForecast.model
            ],

            datasets: [
                {
                    label: "RMSE (INR)",

                    data: [
                        rawForecast.RMSE,
                        anomalyAwareForecast.RMSE
                    ]
                }
            ]
        },

        options: {
            responsive: false,

            plugins: {
                title: {
                    display: true,
                    text:
                        "Figure 4. Forecasting RMSE Comparison",
                    font: {
                        size: 22
                    }
                },

                legend: {
                    position: "top"
                }
            },

            scales: {
                y: {
                    beginAtZero: true,

                    title: {
                        display: true,
                        text:
                            "Root Mean Square Error (INR)"
                    }
                },

                x: {
                    title: {
                        display: true,
                        text:
                            "Forecasting Model"
                    }
                }
            }
        }
    }
);

// ==================================================
// COMPLETION
// ==================================================

console.log("");

console.log(
    "=============================================="
);

console.log(
    "RESEARCH FIGURE GENERATION COMPLETE"
);

console.log(
    "=============================================="
);

console.log("");

console.log(
    "Source:",
    resultsPath
);

console.log(
    "inventedValues:",
    lockedResults.inventedValues
);

console.log("");

console.log(
    "Figure 1 -> F1-Score Comparison"
);

console.log(
    "Figure 2 -> Threshold Sensitivity"
);

console.log(
    "Figure 3 -> Forecasting MAE Comparison"
);

console.log(
    "Figure 4 -> Forecasting RMSE Comparison"
);

console.log("");

console.log(
    `Output directory:\n${graphsDir}`
);