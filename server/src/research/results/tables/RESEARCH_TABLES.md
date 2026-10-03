# ExpenseMind AI — Research Tables

Source:
FINAL_RESEARCH_RESULTS.json

Results Status:
LOCKED_FROM_SAVED_RESEARCH_OUTPUTS

Invented Values:
false


TABLE I
RESEARCH DATASET SUMMARY

| Parameter | Value |
|---|---:|
| Dataset Type | Controlled Synthetic Dataset |
| Duration | 90 days |
| Total Transactions | 220 |
| Expense Transactions | 200 |
| Income Transactions | 20 |
| Normal Expenses | 190 |
| Known Anomalies | 10 |
| Random Seed | 20260926 |



TABLE II
ANOMALY DETECTION PERFORMANCE

| Model | TP | TN | FP | FN | Precision | Recall | F1 | Accuracy | FPR |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|

| Z-Score | 8 | 190 | 0 | 2 | 100.00% | 80.00% | 88.89% | 99.00% | 0.00% |

| Isolation Forest | 2 | 190 | 0 | 8 | 100.00% | 20.00% | 33.33% | 96.00% | 0.00% |

| Hybrid | 2 | 190 | 0 | 8 | 100.00% | 20.00% | 33.33% | 96.00% | 0.00% |




TABLE III
ISOLATION FOREST THRESHOLD SENSITIVITY ANALYSIS

| Threshold | Precision | Recall | F1 | FPR | Accuracy |
|---:|---:|---:|---:|---:|---:|

| 0.50 | 41.67% | 100.00% | 58.82% | 7.37% | NaN% |

| 0.55 | 60.00% | 90.00% | 72.00% | 3.16% | NaN% |

| 0.60 | 75.00% | 60.00% | 66.67% | 1.05% | NaN% |

| 0.65 | 100.00% | 20.00% | 33.33% | 0.00% | NaN% |

| 0.70 | 100.00% | 10.00% | 18.18% | 0.00% | NaN% |

| 0.75 | 0.00% | 0.00% | 0.00% | 0.00% | NaN% |

| 0.80 | 0.00% | 0.00% | 0.00% | 0.00% | NaN% |




TABLE IV
FORECASTING PERFORMANCE

| Model | MAE | RMSE |
|---|---:|---:|
| Linear Trend Regression | ₹4249.63 | ₹5886.92 |
| Anomaly-Aware Linear Trend Regression | ₹3769.59 | ₹6141.93 |



TABLE V
FORECASTING IMPROVEMENT

| Metric | Raw Linear Trend | Anomaly-Aware | Improvement |
|---|---:|---:|---:|
| MAE | ₹4249.63 | ₹3769.59 | 11.30% |
| RMSE | ₹5886.92 | ₹6141.93 | -4.33% |



TABLE VI
EXPERIMENT CONFIGURATION

| Parameter | Value |
|---|---|
| Dataset | ExpenseMind Research Dataset |
| Total Expense Transactions | 200 |
| Observation Days | 89 |
| Training Days | 71 |
| Testing Days | 18 |
| Train/Test Split | 80% chronological training / 20% chronological testing |
| Test Data Used for Training | No |
| Anomaly Detection Method | Hybrid Z-Score + Isolation Forest |
| Z-Score Threshold | 2.5 |
| Isolation Forest Threshold | 0.55 |
| Training Anomalies Removed | 6 |
| Test Anomalies Used for Training | No |