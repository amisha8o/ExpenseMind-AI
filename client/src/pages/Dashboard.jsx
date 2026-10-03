import React, { useEffect, useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Sparkles,  
  ArrowRight,
  ShieldAlert,
  Zap,
  Activity
} from 'lucide-react';
import StatCard from '../components/StatCard';
import TransactionCard from '../components/TransactionCard';
import { api } from '../services/api';
import './Dashboard.css';

export default function Dashboard({ 
  user,
  transactions, 
  budgets, 
  aiInsights, 
  onNavigate, 
  onOpenAddExpense,
  onDeleteTransaction
}) {

 const [monthlyAnalytics, setMonthlyAnalytics] = useState(null);
 const [categoryAnalytics, setCategoryAnalytics] = useState(null);
 const [weeklyAnalytics, setWeeklyAnalytics] = useState(null);
 const [financialHealth, setFinancialHealth] = useState(null);
 const [anomalyData, setAnomalyData] = useState(null);
 const [forecastData, setForecastData] = useState(null);
 const currency = user?.currency || "INR";
 const money = new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 2 });

 useEffect(() => {
  const loadDashboardData = async () => {
    try {

      const [
    summary,
    monthly,
    weekly,
    category,
    health,
    anomalies,
    forecast
] = await Promise.all([
    api.getDashboardSummary(),
    api.getMonthlyAnalytics(),
    api.getWeeklyAnalytics(),
    api.getCategoryAnalytics(),
    api.getFinancialHealth(),
    api.getExpenseAnomalies(),
    api.getExpenseForecast()
]);

      console.log("Dashboard Summary:", summary);
      console.log("Monthly Analytics:", monthly);
      console.log("Financial Health:", health);
      console.log("Category Analytics:", category);
      console.log("Weekly Analytics:", weekly);
      console.log("ANOMALY API RESPONSE:", anomalies);

      setMonthlyAnalytics(monthly);
      setWeeklyAnalytics(weekly);
      setCategoryAnalytics(category);
      setFinancialHealth(health);
      setAnomalyData(anomalies);
      setForecastData(forecast);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    }
  };
  loadDashboardData();
}, []);
 
  
  // Monthly financial data from backend
  const incomeTotal = Number(monthlyAnalytics?.monthlyIncome || 0);

  const expenseTotal = Number(monthlyAnalytics?.monthlyExpense || 0);

  const netSavings = Number(
    monthlyAnalytics?.balance ?? (incomeTotal - expenseTotal)
  );

  const savingsRate = Number(
    monthlyAnalytics?.savingsRate ??
    (incomeTotal > 0
      ? ((netSavings / incomeTotal) * 100)
      : 0)
  ).toFixed(1);

const recentTransactions = transactions.slice(0, 5);
         

  // NEW: derive AI savings stat card from real aiInsights data
  const extractDollarAmount = (text) => {
    if (!text) return 0;
    const match = String(text).match(/\$([\d,]+(\.\d+)?)/);
    return match ? parseFloat(match[1].replace(/,/g, '')) : 0;
  };

  const aiSavingsTotal = aiInsights.reduce(
    (sum, insight) => sum + extractDollarAmount(insight.savingsPotential),
    0
  );

  const aiActionsCount = aiInsights.length;

  // Bucket the current month's transactions into 4 weeks and sum
  // income vs. expense per week, so the chart reflects real data.
  
  const weeklyData = weeklyAnalytics?.weeks || [
  { label: "W1", income: 0, expense: 0 },
  { label: "W2", income: 0, expense: 0 },
  { label: "W3", income: 0, expense: 0 },
  { label: "W4", income: 0, expense: 0 },
];
  const chartMax = Math.max(1, ...weeklyData.flatMap(w => [w.income, w.expense]));

  // Chart geometry (matches the 500x180 viewBox below)
  const CHART_TOP = 20;
  const CHART_BOTTOM = 140;
  const CHART_HEIGHT = CHART_BOTTOM - CHART_TOP;
  const GROUP_START_X = [65, 165, 265, 365];

  const scaleHeight = (value) => {
    if (value <= 0) return 0;
    // Keep a minimum sliver so a small nonzero value is still visible
    return Math.max(4, (value / chartMax) * CHART_HEIGHT);
  };

  const currentMonthLabel = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return (
    <div className="dashboard-page">
      {/* Top Welcome Banner */}
      <div className="dashboard-welcome glass-panel">
        <div className="welcome-text">
          <h2>Financial Command Center</h2>
          <p>
  AI Neural Engine has analyzed your spending.
  Savings rate is <strong>{savingsRate}%</strong> this month.
</p>
        </div>
        <div className="welcome-actions">
          <button className="btn-ai" onClick={() => onNavigate('ai-insights')}>
            <Sparkles size={16} />
            <span>AI Advisor</span>
          </button>
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="stat-cards-grid">
        <StatCard
          title="Total Income"
          value={money.format(incomeTotal)}
          change=""
          isPositive={true}
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Total Expenses"
          value={money.format(expenseTotal)}
          change=""
          isPositive={true}
          icon={TrendingDown}
          color="amber"
        />
        <StatCard
          title="Net Cash Savings"
          value={money.format(netSavings)}
          change={`Savings Rate ${savingsRate}%`}
          isPositive={netSavings >= 0}
          icon={DollarSign}
          color="cyan"
        />
        <StatCard
          title="AI Savings Opportunity"
          value={`${money.format(aiSavingsTotal)} / mo`}
          change={`${aiActionsCount} Actions`}
          isPositive={true}
          icon={Sparkles}
          color="purple"
          isAi={true}
        />
      </div>

    
{/* Financial Health */}
<div className="financial-health-card glass-panel">
  <div>
    <span className="health-label">Financial Health</span>

    <h3>
      {financialHealth?.financialHealthScore ?? 0}/100
    </h3>

    <p>
      {financialHealth?.financialStatus || "Calculating..."}
    </p>
  </div>

  <div className="health-details">

    <span>
      Savings: {money.format(Number(netSavings || 0))}
    </span>

    <span>
      Savings Rate: {savingsRate}%
    </span>

    <span>
      Risk: {financialHealth?.riskLevel || "Calculating..."}
    </span>

  </div>

  {/* AI Financial Health Breakdown */}
  {financialHealth?.healthScoreBreakdown && (
    <div className="health-score-breakdown">

      <div className="health-breakdown-item">
        <span>Savings Health</span>
        <strong>
          {financialHealth.healthScoreBreakdown.savingsScore?.score ?? 0}/100
        </strong>
      </div>

      <div className="health-breakdown-item">
        <span>Budget Management</span>
        <strong>
          {financialHealth.healthScoreBreakdown.budgetScore?.score ?? 0}/100
        </strong>
      </div>

      <div className="health-breakdown-item">
        <span>Goal Progress</span>
        <strong>
          {financialHealth.healthScoreBreakdown.goalScore?.score ?? 0}/100
        </strong>
      </div>

      <div className="health-breakdown-item">
        <span>Financial Stability</span>
        <strong>
          {financialHealth.healthScoreBreakdown.stabilityScore?.score ?? 0}/100
        </strong>
      </div>

    </div>
  )}
</div>

{/* Spending Breakdown */}
<div className="spending-breakdown-card glass-panel">
  <div className="section-header">
    <div>
      <span className="health-label">Spending Breakdown</span>
      <h3>Where your money goes</h3>
    </div>

    <div className="spending-period-meta">
      <span className="period-badge">All Transactions</span>
      <strong>Total: {money.format(Number(categoryAnalytics?.totalExpense || 0))}</strong>
    </div>
  </div>

  <div className="category-list">
    {(categoryAnalytics?.categories || []).length === 0 ? (
      <p>No expense data available.</p>
    ) : (
      categoryAnalytics.categories.map((item) => (
        <div className="category-item" key={item.category}>
          <div className="category-info">
            <span>{item.category}</span>
            <span>
              {money.format(Number(item.amount || 0))}
            </span>
          </div>

          <div className="category-progress">
            <div
              className="category-progress-fill"
              style={{ width: `${item.percentage}%` }}
            />
          </div>

          <div className="category-meta">
            <span>{item.percentage}%</span>
            <span>{item.transactionCount} transactions</span>
          </div>
        </div>
      ))
    )}
  </div>
</div>

<div className="anomaly-detection-card glass-panel">

    <div className="section-header">
        <div>
            <span className="health-label">
                AI Anomaly Detection
            </span>

            <h3>
                Unusual Spending Analysis
            </h3>
        </div>

        <span className="anomaly-model">
            Isolation Forest
        </span>
    </div>


    <div className="anomaly-stats">

        <div className="anomaly-stat">
            <span>Total Transactions</span>

            <strong>
                {anomalyData?.totalTransactions ?? 0}
            </strong>
        </div>


        <div className="anomaly-stat">
            <span>Anomalies Detected</span>

            <strong>
                {anomalyData?.statistics?.anomalyCount ?? 0}
            </strong>
        </div>


        <div className="anomaly-stat">
            <span>Anomaly Rate</span>

            <strong>
                {anomalyData?.statistics?.anomalyRate ?? 0}%
            </strong>
        </div>

    </div>


    <div className="anomaly-baseline">

        <span>
            Average Expense:
            {money.format(Number(anomalyData?.baseline?.averageExpense || 0))}
        </span>

        <span>
            Standard Deviation:
            {Number(
                anomalyData?.baseline?.standardDeviation || 0
            ).toLocaleString("en-IN")}
        </span>

    </div>


    {(anomalyData?.anomalies || []).length === 0 ? (

        <div className="no-anomaly">
            <strong>
                No unusual spending detected
            </strong>

            <p>
                Your recent expense transactions
                follow the detected spending pattern.
            </p>
        </div>

    ) : (

        <div className="anomaly-list">

            <div className="anomaly-alert">
                ⚠ Unusual Spending Detected
            </div>


            {anomalyData.anomalies.map(
                (anomaly) => (

                    <div
                        className="anomaly-item"
                        key={anomaly.transactionId}
                    >

                        <div className="anomaly-item-main">

                            <strong>
                                {anomaly.title}
                            </strong>

                            <span>
                                {anomaly.category}
                            </span>

                        </div>


                        <div className="anomaly-amount">

                                                        {Number(
                                anomaly.amount || 0
                            ).toLocaleString("en-IN")}

                        </div>


                        <div className="anomaly-meta">

                            <span>
                                Risk: {anomaly.riskLevel}
                            </span>

                            <span>
                                Score:{" "}
                                {anomaly.anomalyScore}
                            </span>

                            <span>
                                Z-score:{" "}
                                {anomaly.zScore}
                            </span>

                        </div>


                        <p className="anomaly-explanation">
                            {anomaly.explanation}
                        </p>

                    </div>

                )
            )}

        </div>

    )}

</div>

{forecastData &&
    forecastData.status === "SUCCESS" && (

    <div className="dashboard-card">

        <div className="card-header">
            <div>
                <h3>AI Expense Forecast</h3>
                <p>
                    Anomaly-aware spending prediction
                </p>
            </div>
        </div>

        <div className="forecast-grid">

            <div className="forecast-item">
                <span>Next Day</span>

                <strong>
                    {money.format(Number(forecastData.forecast?.nextDayExpense || 0))}
                </strong>
            </div>


            <div className="forecast-item">
                <span>
                    Raw 30-Day Forecast
                </span>

                <strong>
                    {money.format(Number(forecastData.forecast?.rawNext30DayExpense || 0))}
                </strong>
            </div>


            <div className="forecast-item">
                <span>
                    AI 30-Day Forecast
                </span>

                <strong>
                    {money.format(Number(forecastData.forecast?.anomalyAwareNext30DayExpense || 0))}
                </strong>
            </div>


            <div className="forecast-item">
                <span>
                    Detected Anomalies
                </span>

                <strong>
                    {forecastData.detectedAnomalies}
                </strong>
            </div>

        </div>


        <div className="forecast-model">

            <span>Model</span>

            <strong>
                {forecastData.model}
            </strong>

        </div>


        <div className="forecast-metrics">

            <div>
                <span>Raw MAE</span>

                <strong>
                    {money.format(Number(forecastData.evaluation?.rawTrendModel?.MAE || 0))}
                </strong>
            </div>


            <div>
                <span>AI MAE</span>

                <strong>
                    {money.format(Number(forecastData.evaluation?.anomalyAwareModel?.MAE || 0))}
                </strong>
            </div>


            <div>
                <span>MAE Improvement</span>

                <strong>
                    {Number(
                        forecastData.evaluation
                            ?.improvement
                            ?.MAEImprovementPercentage || 0
                    ).toFixed(2)}
                    %
                </strong>
            </div>

        </div>

    </div>
)}

      {/* Main Grid: Visual Analytics & Recent Transactions */}
      <div className="dashboard-main-grid">
        {/* Left Column: Spending Breakdown & Visual SVG Bar Chart */}
        <div className="chart-widget glass-panel">
          <div className="widget-header">
            <div>
              <h3>Income vs Expense Analytics</h3>
              <p className="widget-subtitle">Monthly cash flow comparison</p>
            </div>
            <span className="badge badge-cyan">{currentMonthLabel}</span>
          </div>

          <div className="svg-chart-container">
            <svg viewBox="0 0 500 180" className="dashboard-svg-chart">
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="var(--border)" />
              <line x1="40" y1="60" x2="480" y2="60" stroke="var(--border)" />
              <line x1="40" y1="100" x2="480" y2="100" stroke="var(--border)" />
              <line x1="40" y1="140" x2="480" y2="140" stroke="var(--border-strong)" />

              {/* Bars: driven by real transaction data (weeklyData) */}
              {weeklyData.map((week, i) => {
                const x = GROUP_START_X[i];
                const incomeH = scaleHeight(week.income);
                const expenseH = scaleHeight(week.expense);
                return (
                  <g key={week.label}>
                    <rect
                      x={x}
                      y={CHART_BOTTOM - incomeH}
                      width="22"
                      height={incomeH}
                      rx="4"
                      fill="url(#emeraldGrad)"
                    >
                      <title>{ `Income: ${money.format(week.income)}` }</title>                    </rect>
                    <rect
                      x={x + 27}
                      y={CHART_BOTTOM - expenseH}
                      width="22"
                      height={expenseH}
                      rx="4"
                      fill="url(#roseGrad)"
                    >
                      <title>{ `Expenses: ${money.format(week.expense)}` }</title>
                    </rect>
                    <text x={x + 24} y="160" fill="var(--text-muted)" fontSize="11" textAnchor="middle">
                      {week.label}
                    </text>
                  </g>
                );
              })}

              {/* Gradient Definitions */}
              <defs>
                <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
                <linearGradient id="roseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="chart-legend">
            <div className="legend-item">
              <span className="legend-dot emerald"></span>
              <span>Income Flow</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot rose"></span>
              <span>Expenses</span>
            </div>
          </div>
        </div>

        {/* Right Column: AI Live Suggestions */}
        <div className="ai-feed-widget glass-panel">
          <div className="widget-header">
            <h3><Sparkles className="gradient-ai-text" size={18} /> Neural Recommendations</h3>
            <button className="text-link-btn" onClick={() => onNavigate('ai-insights')}>View All</button>
          </div>

          <div className="ai-feed-list">
            {aiInsights.slice(0, 2).map((item) => (
              <div key={item.id} className="ai-feed-card">
                <div className="feed-card-header">
                  <span className="feed-title">{item.title}</span>
                  <span className="feed-date">{item.date}</span>
                </div>
                <p className="feed-desc">{item.message}</p>
                <div className="feed-footer">
                  <span className="save-tag">Potential Savings: <strong>{item.savingsPotential}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Activity Table */}
      <div className="recent-activity-widget glass-panel">
        <div className="widget-header">
          <div>
            <h3>Recent Transactions</h3>
            <p className="widget-subtitle">Latest recorded incomes and expenses</p>
          </div>
          <button className="btn-secondary" onClick={() => onNavigate('transactions')}>
            <span>All Transactions</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="tx-list">
          {recentTransactions.map((tx) => (
            <TransactionCard 
              key={tx.id} 
              transaction={tx} 
              onDelete={onDeleteTransaction}
            />
          ))}
        </div>
      </div>
    </div>
  );
}