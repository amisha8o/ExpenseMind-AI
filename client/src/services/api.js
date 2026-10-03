// Real API service — talks to the Express backend, no more mock/localStorage data.

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const TOKEN_KEY = "expense_token";
const USER_KEY = "expense_user";

// ---------- Token / User storage helpers ----------
const getToken = () => localStorage.getItem(TOKEN_KEY);
const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
const clearToken = () => localStorage.removeItem(TOKEN_KEY);

const setStoredUser = (user) => localStorage.setItem(USER_KEY, JSON.stringify(user));
const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
const clearStoredUser = () => localStorage.removeItem(USER_KEY);

// ---------- Core request helper ----------
async function request(path, options = {}) {
  const token = getToken();

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(body.message || "Request failed");
  }

  return body.data;
}

// ---------- Normalizers ----------
const normalizeExpense = (e) => ({
  id: e._id,
  title: e.title,
  amount: e.amount,
  type: "expense",
  category: e.category,
  date: e.expenseDate,
  note: e.notes || "",
});

const normalizeIncome = (i) => ({
  id: i._id,
  title: i.source,
  amount: i.amount,
  type: "income",
  category: i.category,
  date: i.incomeDate,
  note: i.notes || "",
});

const BUDGET_COLORS = [
  "#3b82f6",
  "#10b981",
  "#8b5cf6",
  "#f59e0b",
  "#ec4899",
  "#06b6d4",
  "#f43f5e",
  "#22c55e",
];

const colorForCategory = (category) => {
  let hash = 0;

  for (let i = 0; i < category.length; i++) {
    hash =
      category.charCodeAt(i) +
      ((hash << 5) - hash);
  }

  return BUDGET_COLORS[
    Math.abs(hash) % BUDGET_COLORS.length
  ];
};

export const api = {

  // ---------------- Auth ----------------

  async login(email, password) {
    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    setToken(data.token);
    setStoredUser(data.user);

    return data.user;
  },

  async forgotPassword(email) {
    return await request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(token, password) {
    return await request(`/auth/reset-password/${token}`, {
      method: "POST",
      body: JSON.stringify({ password }),
    });
  },

  async register(fullName, email, password) {
    const data = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ fullName, email, password }),
    });

    setToken(data.token);
    setStoredUser(data.user);

    return data.user;
  },

  logout() {
    clearToken();
    clearStoredUser();
  },

  isAuthenticated() {
    return !!getToken();
  },

  getCurrentUser() {
    return getStoredUser();
  },

  async updateUserProfile(updatedData) {
    const updated = await request("/users/profile", {
      method: "PUT",
      body: JSON.stringify({
        fullName: updatedData.fullName,
        email: updatedData.email,
        currency: updatedData.currency,
        aiSensitivity: updatedData.aiSensitivity,
      }),
    });

    setStoredUser(updated);
    return updated;
  },

  // ---------------- Goals ----------------

  async getGoals() {
    return await request("/goals", { method: "GET" });
  },

  async getGoalSummary() {
    return await request("/goals/summary", { method: "GET" });
  },

  async createGoal(goal) {
    return await request("/goals", {
      method: "POST",
      body: JSON.stringify(goal),
    });
  },

  async updateGoal(id, goal) {
    return await request(`/goals/${id}`, {
      method: "PUT",
      body: JSON.stringify(goal),
    });
  },

  async deleteGoal(id) {
    await request(`/goals/${id}`, { method: "DELETE" });
  },

  async contributeToGoal(id, amount) {
    return await request(`/goals/${id}/contribute`, {
      method: "POST",
      body: JSON.stringify({ amount: Number(amount) }),
    });
  },

  async getReport(params = {}) {
    const query = new URLSearchParams();
    if (params.startDate) query.set("startDate", params.startDate);
    if (params.endDate) query.set("endDate", params.endDate);
    return await request(`/reports${query.toString() ? `?${query.toString()}` : ""}`, { method: "GET" });
  },

  async downloadReportCsv(params = {}) {
    const query = new URLSearchParams();
    if (params.startDate) query.set("startDate", params.startDate);
    if (params.endDate) query.set("endDate", params.endDate);
    const token = getToken();
    const res = await fetch(`${API_BASE}/reports/export/csv${query.toString() ? `?${query.toString()}` : ""}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || "CSV export failed");
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expensemind-report-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },

  async getBudgetIntelligence() {
    return await request("/budgets/intelligence", {
        method: "GET",
    });
},

  async getFinancialIntelligence() {
    return await request("/financial-intelligence", {
      method: "GET",
    });
  },

async getExpenseAnomalies() {
    return await request("/anomalies/expenses", {
        method: "GET",
    });
},
async getExpenseForecast() {
    return await request("/forecast", {
        method: "GET",
    });
},

  // ---------------- Dashboard ----------------

  async getDashboardSummary() {
    return await request("/dashboard/summary", {
      method: "GET",
    });
  },

  async getMonthlyAnalytics() {
    return await request("/dashboard/monthly", {
      method: "GET",
    });
  },

  async getWeeklyAnalytics() {
  return await request("/dashboard/weekly", {
    method: "GET",
  });
},

  async getCategoryAnalytics() {
    return await request("/dashboard/category", {
      method: "GET",
    });
  },

  async getRecentTransactions() {
    return await request("/dashboard/recent", {
      method: "GET",
    });
  },

  async getFinancialHealth() {
    return await request("/dashboard/health", {
      method: "GET",
    });
  },

  // ---------------- Transactions ----------------

  async getTransactions() {
    const [expenses, incomes] = await Promise.all([
      request("/expenses", { method: "GET" }),
      request("/income", { method: "GET" }),
    ]);

    const merged = [
      ...expenses.map(normalizeExpense),
      ...incomes.map(normalizeIncome),
    ];

    merged.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    return merged;
  },


  async addTransaction(newTx) {
    if (newTx.type === "income") {
      const created = await request("/income", {
        method: "POST",
            body: JSON.stringify({
  source: newTx.title,
  amount: newTx.amount,
  category: newTx.category,
  incomeDate: newTx.date,
  notes: newTx.note || "",
}),     
 });

      return normalizeIncome(created);
    }

    const created = await request("/expenses", {
      method: "POST",
           body: JSON.stringify({
  title: newTx.title,
  amount: newTx.amount,
  category: newTx.category,
  expenseDate: newTx.date,
  notes: newTx.note || "",
}),
    });

    return normalizeExpense(created);
  },

  async deleteTransaction(id, type) {
    const path =
      type === "income"
        ? `/income/${id}`
        : `/expenses/${id}`;

    await request(path, {
      method: "DELETE",
    });

    return this.getTransactions();
  },

  // ---------------- Budgets ----------------

  async getBudgets() {
    const budgets = await request("/budgets", {
      method: "GET",
    });

    return budgets.map((b) => ({
      ...b,
      limit: b.limitAmount,
      color: colorForCategory(b.category),
    }));
  },

  async updateBudget(category, newLimit) {
    const raw = await request("/budgets", {
      method: "GET",
    });

    const match = raw.find(
      (b) => b.category === category
    );

    if (!match) {
      throw new Error(
        `No budget found for category "${category}"`
      );
    }

    await request(`/budgets/${match._id}`, {
      method: "PUT",
      body: JSON.stringify({
        limitAmount: Number(newLimit),
      }),
    });

    return this.getBudgets();
  },

  // ---------------- AI Insights ----------------

  getAIInsights() {
    try {
      const raw = localStorage.getItem(
        "expense_ai_insights_cache"
      );

      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  async generateNewAIInsight(userPrompt) {
    const report = await request("/ai/analyze", {
      method: "POST",
      body: JSON.stringify({
        query: userPrompt,
      }),
    });

    const riskLevel =
      (report.riskLevel || "").toLowerCase();

    const type =
      riskLevel.includes("high")
        ? "warning"
        : riskLevel.includes("low")
        ? "success"
        : "info";

    const messageParts = [
      report.financialSummary,
      ...(Array.isArray(report.topInsights)
        ? report.topInsights
        : []),
      ...(Array.isArray(report.savingSuggestions)
        ? report.savingSuggestions
        : []),
    ].filter(Boolean);

    const insight = {
      id: "ai-" + Date.now(),
      type,
      title: `AI Analysis: "${
        userPrompt.length > 30
          ? userPrompt.slice(0, 30) + "..."
          : userPrompt
      }"`,
      message: messageParts.join(" "),
      savingsPotential:
        report.budgetRecommendation || "See details",
      date: "Just now",
      raw: report,
    };

    const current = this.getAIInsights();

    const updated = [insight, ...current];

    localStorage.setItem(
      "expense_ai_insights_cache",
      JSON.stringify(updated)
    );

    return insight;
  },
};