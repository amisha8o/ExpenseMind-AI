# ExpenseMind AI
<img width="1767" height="922" alt="Screenshot 2026-10-03 170223" src="https://github.com/user-attachments/assets/03fefcbc-4f47-401c-929f-8e4ad90bed8d" />
<img width="1757" height="921" alt="Screenshot 2026-10-03 185300" src="https://github.com/user-attachments/assets/5923d2d3-2ca6-4629-a728-e5ac51d42623" />
<img width="1907" height="895" alt="Screenshot 2026-10-03 185314" src="https://github.com/user-attachments/assets/db4eadaf-3844-49b9-af0b-ed9da208193e" />
<img width="1911" height="921" alt="Screenshot 2026-10-03 185326" src="https://github.com/user-attachments/assets/99c8fdd2-475f-4c7b-8e69-81954c318968" />
<img width="1905" height="922" alt="Screenshot 2026-10-03 185344" src="https://github.com/user-attachments/assets/f196fc3c-a53f-4e74-a0a1-7804e9912137" />
<img width="1907" height="923" alt="Screenshot 2026-10-03 185356" src="https://github.com/user-attachments/assets/278d0f5d-fde1-4066-ac0c-3fd55232c7e7" />


## AI-Powered Personal Finance & Expense Management System

<p align="center">

**ExpenseMind AI** is a full-stack intelligent financial management platform that helps users track income and expenses, manage budgets and financial goals, analyze spending patterns, detect unusual transactions, forecast expenses, and receive AI-powered financial insights.

</p>

<p align="center">

![React](https://img.shields.io/badge/Frontend-React%2019-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Build-Vite-646CFF?logo=vite&logoColor=white)
![Node](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/API-Express.js-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)
![Gemini](https://img.shields.io/badge/AI-Gemini-4285F4?logo=google&logoColor=white)
![License](https://img.shields.io/badge/Project-Academic%20%2F%20Research-blue)

</p>

---

## 🌐 Live Application

### Frontend

**ExpenseMind AI**

https://expense-mind-ai-beta.vercel.app/

> If your final Vercel deployment URL is different, replace the URL above with the actual production URL.

### Backend API

**ExpenseMind AI API**

https://expensemind-ai.onrender.com

### Backend Health Check

https://expensemind-ai.onrender.com/api/health

Expected response:

{
  "success": true,
  "status": "Healthy"
}


### 🚀 Overview

ExpenseMind AI is an AI-powered personal finance management system developed using the MERN ecosystem.

The platform combines traditional financial tracking with analytics, machine learning, anomaly detection, forecasting, financial health assessment, budget intelligence, financial goal tracking, and AI-generated recommendations.

## The system is designed around a simple workflow:

User
  ↓
Authentication
  ↓
Financial Data
  ↓
MongoDB
  ↓
Backend Analytics
  ↓
AI / ML Intelligence
  ↓
Dashboard & Insights
  ↓
Recommendations

Instead of only storing financial transactions, ExpenseMind AI attempts to transform transaction data into actionable financial insights.

# 🎯 Problem Statement

Managing personal finances manually can make it difficult to:

Track spending consistently
Identify unusual transactions
Understand spending categories
Monitor budgets
Track financial goals
Forecast upcoming expenses
Understand overall financial health
Convert transaction history into useful insights

ExpenseMind AI addresses these challenges by integrating financial management with analytics and AI/ML-based analysis.

# 🎯 Objectives

The major objectives of ExpenseMind AI are:

Build a centralized personal finance management platform.
Provide secure user authentication.
Manage income, expenses, and transactions.
Provide category-wise and time-based analytics.
Track budgets and budget utilization.
Track financial goals and contributions.
Calculate a financial health score.
Detect unusual financial transactions.
Forecast future expenses.
Generate AI-powered financial recommendations.
Provide reports and export functionality.
Evaluate anomaly detection and forecasting approaches through reproducible research experiments.

# ✨ Key Features
🔐 Authentication
User registration
User login
JWT-based authentication
Protected API routes
Password reset workflow
Secure password hashing
User profile management
# 💰 Income Management

Users can record income transactions such as:

Salary
Freelance income
Investments
Other income sources

Income data contributes to:

Total income
Net balance
Savings calculations
Financial health analysis
Cash-flow analytics
# 💸 Expense Management

Users can create and manage expenses with information such as:

Expense title
Amount
Category
Date
Description

Supported categories include examples such as:

Food & Dining
Entertainment
Transport
Health & Wellness
Shopping
Bills & Utilities
Subscriptions
Other
# 📊 Financial Dashboard

The dashboard provides a centralized view of the user's financial activity.

Dashboard includes:
Total income
Total expenses
Net cash savings
Savings rate
Financial health score
Spending breakdown
Category analytics
Recent transactions
AI recommendations
Anomaly detection summary
Income vs expense analytics

The dashboard is designed to convert raw transactions into an understandable financial overview.

# 📈 Analytics

ExpenseMind AI provides financial analytics across different dimensions.

Spending Analytics

Users can analyze:

Category-wise expenses
Total spending
Transaction counts
Income vs expense
Cash flow
Monthly trends
Weekly trends
# Example analytical flow
Transactions
     ↓
Category Aggregation
     ↓
Financial Metrics
     ↓
Charts / Visualizations
     ↓
User Insights
# 🎯 Budget Management

The budget module allows users to create category-based spending limits.

The system can track:

Budget Limit
      ↓
Actual Spending
      ↓
Utilization
      ↓
Budget Status
      ↓
Budget Intelligence

Budget intelligence can help identify areas where spending may require attention.

# 🏆 Financial Goals

Users can create financial goals and track progress.

Example:

Goal:
Laptop Fund

Target:
₹20,000

Current Contribution:
₹500

Progress:
2.5%

Goal functionality includes:

Goal creation
Target amount
Current progress
Contributions
Withdrawals
Goal status
Deadline tracking
Progress visualization
# ❤️ Financial Health Score

ExpenseMind AI calculates a financial health score using financial indicators such as:

Savings health
Budget management
Goal progress
Financial stability

The dashboard presents the score along with supporting indicators.

# Example:

Financial Health
       ↓
Savings Health
       ↓
Budget Management
       ↓
Goal Progress
       ↓
Financial Stability
# 🤖 AI and Machine Learning

ExpenseMind AI integrates AI/ML functionality at multiple levels.

1. Anomaly Detection

The system analyzes expense transactions to identify unusual spending behavior.

The research implementation evaluates:

Statistical anomaly detection
Isolation Forest
Hybrid anomaly detection

2. Statistical Anomaly Detection

Statistical analysis uses transaction-level characteristics to identify observations that significantly deviate from normal spending patterns.

One of the evaluated approaches uses Z-score based detection.

3. Isolation Forest

Isolation Forest is used as a machine-learning-based anomaly detection method.

The idea is to identify observations that can be isolated relatively easily from the rest of the data.

4. Hybrid Anomaly Detection

The research pipeline also evaluates a hybrid approach combining statistical and machine-learning-based anomaly signals.

# 🔮 Expense Forecasting

ExpenseMind AI includes expense forecasting functionality.

The research pipeline evaluates:

Baseline Forecasting

A linear forecasting approach is evaluated as a baseline.

Anomaly-Aware Forecasting

An anomaly-aware approach evaluates forecasting after accounting for unusual transactions.

The research compares the forecasting error using:

MAE
RMSE
# 🧠 Gemini AI

ExpenseMind AI integrates Google's Gemini API for AI-powered financial analysis.

The AI layer is intended to support:

Financial insights
Personalized recommendations
Spending analysis
Budget-related suggestions
Financial explanations

The Gemini API key is stored through environment variables and is never intended to be committed to the repository.

# 💡 AI Recommendation Engine

The recommendation layer uses financial information to provide contextual suggestions.

Potential recommendation inputs include:

Spending behavior
Budget utilization
Financial health
Savings
Goals
Transaction patterns

The objective is to provide recommendations based on the user's actual financial data rather than static demo information.

# 📱 Application Modules

The application includes the following major modules:

Home
Dashboard
Transactions
Budgets & Goals
Analytics
Reports
AI Insights
AI Log
Expense Management
Profile
Settings

# 🏗 System Architecture
                         ┌─────────────────────┐
                         │       User          │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ React + Vite Client │
                         └──────────┬──────────┘
                                    │
                              REST API
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ Express.js Server   │
                         └──────────┬──────────┘
                                    │
             ┌──────────────────────┼──────────────────────┐
             │                      │                      │
             ▼                      ▼                      ▼
      Authentication          Finance APIs          AI / ML Services
             │                      │                      │
             │                      │              ┌───────┴────────┐
             │                      │              │                │
             ▼                      ▼              ▼                ▼
          JWT Auth              MongoDB       Anomaly          Forecasting
                              / Mongoose      Detection
                                                  │
                                                  ▼
                                           Financial Intelligence
                                                  │
                                                  ▼
                                           AI Recommendations
# 🛠 Technology Stack
Frontend
React 19
Vite
JavaScript
JSX
Lucide React
Responsive UI
# Backend
Node.js
Express.js
MongoDB
Mongoose
JWT
Express Validator
Helmet
CORS
Morgan
Nodemailer
# AI
Google Gemini API
# Machine Learning / Research
Isolation Forest
Statistical anomaly detection
Hybrid anomaly evaluation
Forecasting
MAE
RMSE
Reproducible research pipeline

# 📂 Project Structure
ExpenseMind-AI/
│
├── client/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
│
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── research/
│   │   └── server.js
│   │
│   ├── package.json
│   └── .env.example
│
├── RESEARCH PAPER/
│
├── README.md
│
└── .gitignore

# 🔐 Authentication and Security

Security measures implemented in the backend include:

JWT authentication
Password hashing with bcrypt
Protected routes
Input validation
Helmet security middleware
CORS configuration
Environment-based secrets
Error handling middleware
Authentication middleware

Sensitive credentials are not stored in the repository.

# The following files must remain local:

.env

# Only example configuration files are committed:

.env.example
# 🔬 Research Component

A dedicated research pipeline is included with the project.

# The research component evaluates:

Anomaly Detection
        +
Threshold Sensitivity
        +
Expense Forecasting
        +
Error Evaluation
        ↓
Research Results

The research artifacts include:

Datasets
Experiment scripts
Anomaly detection services
Forecasting services
Evaluation scripts
CSV result tables
JSON result files
Research graphs
Final evaluation outputs
# 🧪 Research Dataset

The locked research experiment uses:

Parameter	Value
Total transactions	220
Duration	90 days
Expenses	200
Income records	20
Normal transactions	190
Anomalies	10
Seed	20260926

The research dataset is controlled and reproducible.

# 📊 Experimental Results

The following results are the locked results used for the research work.

Anomaly Detection
Method	F1 Score
Z-Score	0.8889
Isolation Forest	0.3333
Hybrid	0.3333
# Threshold Evaluation

At the evaluated threshold of 0.55:

Metric	Result
F1 Score	0.7200
# 📉 Forecasting Evaluation
Baseline vs Anomaly-Aware Forecasting
Forecasting Approach	MAE
Linear Baseline	₹4,249.63
Anomaly-Aware	₹3,769.59
# MAE Improvement
MAE Reduction = 11.30%

# The anomaly-aware approach reduced MAE from:

₹4,249.63

# to:

₹3,769.59
# RMSE

The evaluated anomaly-aware forecasting configuration showed:

RMSE Change = +4.33%

Therefore, the research results should be interpreted using both MAE and RMSE rather than relying on a single metric.

# 📊 Research Visualization Categories

The research artifacts include visual analysis for areas such as:

Anomaly detection comparison
Threshold sensitivity
Forecasting performance
MAE comparison
RMSE comparison
Transaction distributions
Research evaluation tables

These visualizations support the quantitative evaluation presented in the research component.

# 📑 Reports

The application provides report functionality for financial data.

Report functionality includes:

Financial summaries
Income information
Expense information
Category information
Analytical information
CSV export
Print / PDF workflow
# 🔌 API Overview

The backend exposes REST APIs for major application modules.

# Authentication
/api/auth

Supports authentication workflows such as:

Registration
Login
Password reset
# Users
/api/users

Supports user profile-related operations.

# Expenses
/api/expenses

Supports expense management.

# Income
/api/income

Supports income management.

# Transactions
/api/transactions

Supports transaction retrieval and management.

# Budgets
/api/budgets

Supports budget management and intelligence.

# Goals
/api/goals

Supports:

Goal creation
Goal updates
Goal deletion
Contributions
Progress tracking
# Analytics
/api/analytics

Provides financial analytics.

# Reports
/api/reports

Provides report-related functionality.

# Anomaly Detection
/api/anomalies

Provides anomaly detection functionality.

Example health/anomaly workflow:

Transaction Data
       ↓
Feature Processing
       ↓
Statistical Analysis
       ↓
Isolation Forest
       ↓
Anomaly Score
       ↓
Financial Insight
# ⚙️ Environment Variables
# Backend

Create:

server/.env

using:

server/.env.example

# Example:

PORT=5000

MONGO_URI=mongodb://127.0.0.1:27017/finance_ai

JWT_SECRET=replace_with_a_long_random_secret

NODE_ENV=development

JWT_EXPIRES_IN=7d

GEMINI_API_KEY=your_gemini_api_key

EMAIL_USER=your_email@example.com

EMAIL_PASSWORD=your_email_app_password

CLIENT_URL=https://expensemind-ai.vercel.app

Never commit real credentials.

# 💻 Local Installation
Prerequisites

Install:

Node.js
npm
MongoDB or MongoDB Atlas
Git
# 1. Clone Repository
git clone https://github.com/amisha8o/ExpenseMind-AI.git
cd ExpenseMind-AI
# 2. Backend Setup
cd server

Install dependencies:

npm install

Create environment file:

Windows
copy .env.example .env

Configure .env.

Start backend:

npm run dev

Production-style start:

npm start

Backend will normally run on:

http://localhost:5000
# 3. Frontend Setup

Open a new terminal.

cd client

Install dependencies:

npm install

Create environment file:

Windows
copy .env.example .env

Configure:

VITE_API_URL=http://localhost:5000/api

Start frontend:

npm run dev

Vite will provide the local frontend URL in the terminal.

# 🧪 Frontend Build

For a production build:

cd client
npm run build

Preview the production build:

npm run preview
# 🚀 Production Deployment

ExpenseMind AI is structured as a separate frontend and backend deployment.

Frontend

Recommended deployment:

Vercel

Frontend root directory:

client

Build command:

npm run build

Output directory:

dist

Frontend environment variable:

VITE_API_URL=https://expensemind-ai.onrender.com/api
# Backend

Recommended deployment:

Render

Backend root directory:

server

Build command:

npm install

Start command:

npm start

Production environment variables should be configured through the hosting provider.

# 🌍 Production URLs
# Frontend
https://expensemind-ai.vercel.app
# Backend
https://expensemind-ai.onrender.com
# Health Check
https://expensemind-ai.onrender.com/api/health
# 📁 Research Artifacts

# Research-related files are maintained inside:

server/src/research/

# The research structure includes artifacts for:

Datasets
Results
Evaluation
Anomaly Detection
Forecasting
Tables
Graphs
Export
Experiment Scripts

The locked experiment results should be preserved when preparing the research paper.

# 🔭 Future Scope

Possible future improvements include:

Advanced receipt OCR
Improved financial forecasting models
Personalized financial planning
More sophisticated anomaly detection
Investment portfolio analysis
Automated recurring transaction detection
Mobile application
Multi-currency improvements
Advanced financial goal recommendations
Larger real-world research datasets
Additional machine-learning models
Long-term user behavior analysis
# 📚 Research References

Key references used in the research component include:

1.Liu, F. T., Ting, K. M., and Zhou, Z.-H.
Isolation Forest.
IEEE International Conference on Data Mining, 2008.
DOI: 10.1109/ICDM.2008.17
2. Isolation-Based Anomaly Detection.
ACM Transactions on Knowledge Discovery from Data, 2012.
DOI: 10.1145/2133360.2133363
3. Money Map.
IEEE ICKECS 2025.
DOI: 10.1109/ICKECS65700.2025.11035699
4. Expense Radar.
IEEE ICCA 2025.
DOI: 10.1109/ICCA66035.2025.11430733
5. Smart AI-Based Personal Finance Assistant.
IJRASET, 2025.
DOI: 10.22214/ijraset.2025.75019
# 🎓 Academic / Research Value

# ExpenseMind AI combines:

Full-Stack Development
        +
Database Management
        +
REST APIs
        +
Authentication
        +
Data Analytics
        +
Artificial Intelligence
        +
Machine Learning
        +
Anomaly Detection
        +
Forecasting
        +
Research Evaluation

This makes the project suitable as a major academic project with a research-oriented implementation.

# 📌 Project Highlights
Full-Stack
React
+
Vite
+
Node.js
+
Express
+
MongoDB
# AI
Gemini
+
Financial Intelligence
+
AI Recommendations
# Machine Learning
Statistical Detection
+
Isolation Forest
+
Hybrid Evaluation
+
Forecasting
# Research
Controlled Dataset
+
Reproducible Experiments
+
Evaluation Metrics
+
Graphs
+
Tables
+
Research Paper
# 👩‍💻 Author
Amisha Kumari

B.Tech Computer Science & Engineering

Government Mahila Engineering College, Ajmer

Profiles
 GitHub: https://github.com/amisha8o
 LinkedIn: https://linkedin.com/in/amisha-kumari-3b80aa2b1/
# ⭐ Project

ExpenseMind AI — AI-Powered Personal Finance & Expense Management System

Built with:

React • Vite • Node.js • Express • MongoDB • JWT • Gemini AI • Machine Learning

