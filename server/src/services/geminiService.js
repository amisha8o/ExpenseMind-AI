import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Returns true for errors worth retrying (transient overload/rate-limit),
// false for anything else (bad request, auth failure, etc. — retrying won't help).
const isRetryableError = (err) => {
    const status = err?.status || err?.code;
    const message = (err?.message || "").toLowerCase();
    return (
        status === 503 ||
        status === 429 ||
        message.includes("unavailable") ||
        message.includes("high demand") ||
        message.includes("rate limit")
    );
};

// Calls Gemini with automatic retry + exponential backoff for transient
// 503 (overloaded) / 429 (rate limited) errors. Non-retryable errors
// (bad API key, invalid model, malformed request) fail immediately.
const generateWithRetry = async (prompt, { maxRetries = 3, baseDelayMs = 1000 } = {}) => {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await ai.models.generateContent({
                model: "gemini-flash-latest",
                contents: prompt,
            });
        } catch (err) {
            lastError = err;

            if (!isRetryableError(err) || attempt === maxRetries) {
                throw err;
            }

            const delay = baseDelayMs * 2 ** attempt; // 1s, 2s, 4s...
            console.warn(
                `Gemini request failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms:`,
                err.message
            );
            await sleep(delay);
        }
    }

    throw lastError;
};

// NEW: accept userQuery as second param
export const analyzeFinance = async (financeData, userQuery) => {

    const prompt = `
You are an expert financial advisor.

The user has asked the following specific question:
"${userQuery}"

Your job is to answer THIS SPECIFIC QUESTION directly, using the financial
data below only as supporting context. Do not give a generic financial
report — every field in your response must be relevant to what the user
actually asked. If the question is about groceries, focus on grocery/food
category spending. If it's about cutting a specific dollar amount, show
concrete categories/transactions that add up to it. If it's about
subscriptions, focus only on recurring transactions.

Financial Data:
Total Income: ₹${financeData.totalIncome}
Total Expense: ₹${financeData.totalExpense}
Current Balance: ₹${financeData.currentBalance}
Financial Health Score: ${financeData.healthScore}

Category Spending:
${JSON.stringify(financeData.categories, null, 2)}

Recent Transactions:
${JSON.stringify(financeData.recentTransactions, null, 2)}

Return ONLY valid JSON in this exact format:

{
  "financialSummary":"",
  "healthScore":"",
  "riskLevel":"",
  "highestExpenseCategory":"",
  "topInsights":[],
  "savingSuggestions":[],
  "budgetRecommendation":"",
  "investmentSuggestion":"",
  "monthlyPlan":"",
  "futurePrediction":""
}
`;

    let response;
    try {
        response = await generateWithRetry(prompt);
    } catch (err) {
        if (isRetryableError(err)) {
            throw new Error("The AI service is experiencing high demand. Please try again in a moment.");
        }
        throw err;
    }

    const rawText = response.text || "";

    // Gemini sometimes wraps JSON in markdown fences (```json ... ```)
    // even when explicitly asked not to. Strip them before parsing.
    const cleaned = rawText
        .trim()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();

    try {
        return JSON.parse(cleaned);
    } catch (err) {
        console.error("Gemini returned non-JSON response:", rawText);
        throw new Error("AI service returned an unexpected response format. Please try again.");
    }
}; 