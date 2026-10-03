# ExpenseMind AI

**AI-Powered Personal Finance & Expense Management System**

ExpenseMind AI is a full-stack MERN finance platform that combines transaction management with financial intelligence, anomaly detection, expense forecasting, budget intelligence, financial goals, and Gemini-powered recommendations.

## Core features

- JWT-based registration, login, password reset, and protected APIs
- Income, expense, and transaction management
- Dashboard analytics and financial health scoring
- Category budgets with live spending utilization and budget intelligence
- Financial goals with progress tracking and contributions
- Expense anomaly detection using statistical and ML approaches
- Expense forecasting with raw and anomaly-aware predictions
- Gemini-powered financial analysis and recommendations
- Server-generated analytics reports and CSV export
- Responsive React/Vite interface
- Research experiment artifacts and reproducible evaluation outputs

## Tech stack

### Frontend
- React 19
- Vite
- JavaScript / JSX
- Lucide React

### Backend
- Node.js
- Express 5
- MongoDB / Mongoose
- JWT authentication
- Express Validator
- Helmet / CORS / rate limiting
- Google Gemini API

### Research / ML
- Isolation Forest
- Statistical anomaly detection
- Hybrid anomaly evaluation
- Expense forecasting and error evaluation
- CSV/JSON research datasets and result tables

## Project structure

```text
ExpenseMind AI/
├── client/              # React + Vite frontend
├── server/              # Express + MongoDB backend
├── RESEARCH PAPER/      # Research paper artifact
├── README.md
└── .gitignore
```

## Local setup

### 1. Backend

```bash
cd server
npm install
copy .env.example .env
npm run dev
```

Configure `MONGO_URI`, `JWT_SECRET`, and `GEMINI_API_KEY` in `server/.env`.

### 2. Frontend

```bash
cd client
npm install
copy .env.example .env
npm run dev
```

The frontend expects the backend API at `http://localhost:5000/api` by default.

## Security

Do **not** commit `.env`, API keys, database credentials, email passwords, JWT secrets, or other private credentials. Only `.env.example` belongs in the repository.

If a secret has ever been exposed outside the local machine, rotate it before publishing the repository.

## Research note

The research result files included in `server/src/research/results/` are preserved as the project's locked experiment artifacts. They should not be regenerated casually when preparing the paper because changing the experiment configuration can invalidate the reported results.

## Status

The application source has been cleaned for a GitHub release and the remaining verification step is to install dependencies in a clean environment and run the frontend/backend tests/builds with the user's real environment variables.
