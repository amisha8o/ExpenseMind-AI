import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Reports from './pages/Reports';
import AIInsights from './pages/AIInsights';
import AddExpense from './pages/AddExpense';
import Profile from './pages/Profile';
import Goals from './pages/Goals';
import { api } from './services/api';
import './App.css';

export default function App() {
  const [activePage, setActivePage] = useState(() => {
    const pathname = window.location.pathname;

    if (pathname.startsWith('/reset-password/')) {
      return 'reset-password';
    }

    return 'home';
  });

  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [loadError, setLoadError] = useState('');

  const resetToken = window.location.pathname.startsWith('/reset-password/')
    ? window.location.pathname.split('/reset-password/')[1]
    : null;

  const loadAppData = async () => {
    try {
      const [txs, bgs] = await Promise.all([
        api.getTransactions(),
        api.getBudgets(),
      ]);

      setTransactions(txs);
      setBudgets(bgs);
      setAiInsights(api.getAIInsights());
    } catch (err) {
      setLoadError(err.message);
      api.logout();
      setUser(null);
      setActivePage('login');
    }
  };

  // On mount: restore session if a token/user exists
  useEffect(() => {
    const currentUser = api.getCurrentUser();

    if (currentUser && api.isAuthenticated()) {
      setUser(currentUser);

      // Don't load dashboard data while resetting password
      if (activePage !== 'reset-password') {
        loadAppData();
      }
    }
  }, []);

  const handleAddTransaction = async (newTxData) => {
    await api.addTransaction(newTxData);

    const [txs, bgs] = await Promise.all([
      api.getTransactions(),
      api.getBudgets(),
    ]);

    setTransactions(txs);
    setBudgets(bgs);
    setIsAddExpenseModalOpen(false);

    if (activePage === 'add-expense') {
      setActivePage('dashboard');
    }
  };

  const handleDeleteTransaction = async (id, type) => {
    const updated = await api.deleteTransaction(id, type);
    setTransactions(updated);

    const bgs = await api.getBudgets();
    setBudgets(bgs);
  };

  const handleUpdateBudget = async (category, newLimit) => {
    const updated = await api.updateBudget(category, newLimit);
    setBudgets(updated);
  };

  const handleGenerateAiInsight = async (prompt) => {
    await api.generateNewAIInsight(prompt);
    setAiInsights(api.getAIInsights());
  };

  const handleUpdateUser = async (updatedData) => {
    const updated = await api.updateUserProfile(updatedData);
    setUser(updated);
  };

  const handleLoginSuccess = async (userData) => {
    setUser(userData);
    setActivePage('dashboard');
    await loadAppData();
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setTransactions([]);
    setBudgets([]);
    setAiInsights([]);
    setActivePage('home');
  };

  const renderContent = () => {
    switch (activePage) {
      case 'home':
        return (
          <Home
            onGetStarted={() =>
              setActivePage(user ? 'dashboard' : 'login')
            }
            onLogin={() => setActivePage('login')}
          />
        );

      case 'login':
        return (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={() => setActivePage('register')}
            onForgotPassword={() => setActivePage('forgot-password')}
          />
        );

      case 'register':
        return (
          <Register
            onRegisterSuccess={handleLoginSuccess}
            onSwitchToLogin={() => setActivePage('login')}
          />
        );

      case 'forgot-password':
        return (
          <ForgotPassword
            onBackToLogin={() => setActivePage('login')}
          />
        );

      case 'reset-password':
        return (
          <ResetPassword
            token={resetToken}
            onBackToLogin={() => setActivePage('login')}
          />
        );

      case 'dashboard':
        return (
          <Dashboard
            user={user}
            transactions={transactions}
            budgets={budgets}
            aiInsights={aiInsights}
            onNavigate={setActivePage}
            onOpenAddExpense={() => setIsAddExpenseModalOpen(true)}
            onDeleteTransaction={handleDeleteTransaction}
          />
        );

      case 'transactions':
        return (
          <Transactions
            transactions={transactions}
            onDeleteTransaction={handleDeleteTransaction}
            onOpenAddExpense={() => setIsAddExpenseModalOpen(true)}
          />
        );

      case 'budgets':
        return (
          <Budgets
            budgets={budgets}
            onUpdateBudget={handleUpdateBudget}
          />
        );

      case 'goals':
        return <Goals />;

      case 'reports':
        return (
          <Reports
            transactions={transactions}
            budgets={budgets}
            user={user}
          />
        );

      case 'ai-insights':
        return (
          <AIInsights
            aiInsights={aiInsights}
            onGenerateInsight={handleGenerateAiInsight}
          />
        );

      case 'add-expense':
        return (
          <AddExpense
            onSubmitSuccess={handleAddTransaction}
            onCancel={() => setActivePage('dashboard')}
          />
        );

      case 'profile':
        return (
          <Profile
            user={user}
            onUpdateUser={handleUpdateUser}
          />
        );

      default:
        return (
          <Home
            onGetStarted={() =>
              setActivePage(user ? 'dashboard' : 'login')
            }
            onLogin={() => setActivePage('login')}
          />
        );
    }
  };

  const isAuthOrLanding =
    activePage === 'home' ||
    activePage === 'login' ||
    activePage === 'register' ||
    activePage === 'forgot-password' ||
    activePage === 'reset-password';

  return (
    <div className="app-shell">
      {!isAuthOrLanding ? (
        <div className="app-layout">
          <Sidebar
            activePage={activePage}
            setActivePage={setActivePage}
            onLogout={handleLogout}
          />

          <div className="app-main-content">
            <Navbar
              activePage={activePage}
              setActivePage={setActivePage}
              onOpenAddExpense={() => setIsAddExpenseModalOpen(true)}
              user={user}
            />

            <main className="page-body">
              {renderContent()}
            </main>
          </div>
        </div>
      ) : (
        <div className="landing-app-layout">
          <header className="standalone-header glass-panel">
            <div
              className="brand"
              onClick={() => setActivePage('home')}
            >
              <span className="brand-title-full">
                Expense<span className="gradient-text">Mind</span> AI
              </span>
            </div>

            <div className="auth-nav-buttons">
              <button
                className="btn-secondary"
                onClick={() => setActivePage('home')}
              >
                Home
              </button>

              {user ? (
                <button
                  className="btn-primary"
                  onClick={() => setActivePage('dashboard')}
                >
                  Dashboard
                </button>
              ) : (
                <>
                  <button
                    className="btn-secondary"
                    onClick={() => setActivePage('login')}
                  >
                    Sign In
                  </button>

                  <button
                    className="btn-primary"
                    onClick={() => setActivePage('register')}
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </header>

          <main className="page-body">
            {renderContent()}
          </main>
        </div>
      )}

      {isAddExpenseModalOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setIsAddExpenseModalOpen(false)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <AddExpense
              onSubmitSuccess={handleAddTransaction}
              onCancel={() => setIsAddExpenseModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}