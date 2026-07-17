/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import { Expense } from "./types";
import { formatCurrency } from "./lib/utils";
import { LayoutDashboard, Receipt, Plus, PieChart as PieChartIcon, Grid, X, LogOut, Cat, Moon, Sun } from "lucide-react";
import Dashboard from "./components/Dashboard";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseList from "./components/ExpenseList";
import Charts from "./components/Charts";
import Categories from "./components/Categories";
import AiChat from "./components/AiChat";
import Auth from "./components/Auth";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budget, setBudget] = useState<number>(5000);
  const [activeTab, setActiveTab] = useState<"dashboard" | "categories" | "history" | "charts">("dashboard");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setBudget(data.user.budget);
        fetchExpenses();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      const res = await fetch("/api/expenses");
      if (res.ok) {
        const data = await res.json();
        setExpenses(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogin = (userData: any) => {
    setUser(userData);
    setBudget(userData.budget);
    fetchExpenses();
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setExpenses([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateBudget = async (newBudget: number) => {
    try {
      const res = await fetch("/api/budget", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budget: newBudget })
      });
      if (res.ok) {
        setBudget(newBudget);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addExpense = async (expenseData: Omit<Expense, "id">) => {
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expenseData)
      });
      if (res.ok) {
        const newExpense = await res.json();
        setExpenses([newExpense, ...expenses]);
        setIsAddModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      if (res.ok) {
        setExpenses(expenses.filter(e => e.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  if (loading) {
    return <div className="min-h-screen bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
    </div>;
  }

  if (!user) {
    return <div className="min-h-screen neo-bg font-sans"><Auth onLogin={handleLogin} /></div>;
  }

  return (
    <div className="min-h-screen neo-bg text-slate-700 dark:text-slate-100 font-sans selection:bg-amber-100 selection:text-amber-900 pb-24 md:pb-0">
      <div className="w-full mx-auto md:flex md:h-screen neo-bg min-h-screen md:min-h-0 relative overflow-hidden">
        
        {/* Navigation - Bottom on mobile, Side on desktop */}
        <nav className="fixed bottom-0 left-0 w-full md:static md:w-64 md:h-full neo-bg px-4 md:px-6 pb-safe pt-2 md:py-8 z-40">
          <div className="md:hidden flex justify-between items-center relative max-w-md mx-auto">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex flex-col items-center p-2 w-16 transition-all duration-300 ${
                activeTab === "dashboard" ? "text-amber-600 scale-110" : "text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:text-slate-200"
              }`}
            >
              <div className={`p-2 rounded-2xl mb-1 ${activeTab === "dashboard" ? "neo-inner text-amber-500" : "neo-shadow-sm text-slate-400 dark:text-slate-400"}`}>
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium">Home</span>
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={`flex flex-col items-center p-2 w-16 transition-all duration-300 ${
                activeTab === "categories" ? "text-amber-600 scale-110" : "text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:text-slate-200"
              }`}
            >
              <div className={`p-2 rounded-2xl mb-1 ${activeTab === "categories" ? "neo-inner text-amber-500" : "neo-shadow-sm text-slate-400 dark:text-slate-400"}`}>
                <Grid className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium">Categories</span>
            </button>
            
            {/* Center FAB */}
            <div className="w-16 flex justify-center -mt-10 relative z-50">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="w-14 h-14 neo-bg rounded-full flex items-center justify-center text-amber-500 neo-shadow transition-all duration-300 active:neo-inner hover:-translate-y-1"
                aria-label="Add expense"
              >
                <Plus className="w-6 h-6 stroke-[3]" />
              </button>
            </div>

            <button
              onClick={() => setActiveTab("history")}
              className={`flex flex-col items-center p-2 w-16 transition-all duration-300 ${
                activeTab === "history" ? "text-amber-600 scale-110" : "text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:text-slate-200"
              }`}
            >
              <div className={`p-2 rounded-2xl mb-1 ${activeTab === "history" ? "neo-inner text-amber-500" : "neo-shadow-sm text-slate-400 dark:text-slate-400"}`}>
                <Receipt className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium">History</span>
            </button>
            <button
              onClick={() => setActiveTab("charts")}
              className={`flex flex-col items-center p-2 w-16 transition-all duration-300 ${
                activeTab === "charts" ? "text-amber-600 scale-110" : "text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:text-slate-200"
              }`}
            >
              <div className={`p-2 rounded-2xl mb-1 ${activeTab === "charts" ? "neo-inner text-amber-500" : "neo-shadow-sm text-slate-400 dark:text-slate-400"}`}>
                <PieChartIcon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium">Charts</span>
            </button>
          </div>

          <div className="hidden md:flex flex-col h-full">
            <div className="flex items-center gap-2 mb-12 px-2 justify-center">
              <div className="w-12 h-12 rounded-full neo-shadow flex items-center justify-center text-amber-500">
                <Cat className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-700 dark:text-slate-100">Neko Ledger</span>
            </div>
            
            <div className="flex-1 space-y-4 px-2">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 ${
                  activeTab === "dashboard" ? "neo-inner text-amber-600 font-bold" : "neo-bg neo-shadow-sm text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:text-slate-100 font-medium active:neo-inner-sm"
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab("categories")}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 ${
                  activeTab === "categories" ? "neo-inner text-amber-600 font-bold" : "neo-bg neo-shadow-sm text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:text-slate-100 font-medium active:neo-inner-sm"
                }`}
              >
                <Grid className="w-5 h-5" />
                Categories
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 ${
                  activeTab === "history" ? "neo-inner text-amber-600 font-bold" : "neo-bg neo-shadow-sm text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:text-slate-100 font-medium active:neo-inner-sm"
                }`}
              >
                <Receipt className="w-5 h-5" />
                Transactions
              </button>
              <button
                onClick={() => setActiveTab("charts")}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 ${
                  activeTab === "charts" ? "neo-inner text-amber-600 font-bold" : "neo-bg neo-shadow-sm text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:text-slate-100 font-medium active:neo-inner-sm"
                }`}
              >
                <PieChartIcon className="w-5 h-5" />
                Analytics
              </button>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="w-full neo-bg text-amber-600 font-bold py-4 px-4 rounded-2xl transition-all neo-shadow flex items-center justify-center gap-2 mt-auto active:neo-inner"
            >
              <Plus className="w-5 h-5 stroke-[3]" />
              New Transaction
            </button>
          </div>
        </nav>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col md:overflow-hidden neo-bg">
          {/* Header with Gradient & subtle texture */}
          <header className="px-6 py-10 md:py-8 neo-bg rounded-b-[2.5rem] md:rounded-none neo-shadow relative overflow-hidden shrink-0 z-10">
            
            <div className="flex justify-between items-center mb-8 relative z-10 md:hidden">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full neo-shadow flex items-center justify-center text-amber-500">
                  <Cat className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-700 dark:text-slate-100">Neko Ledger</h1>
                  <p className="text-slate-500 dark:text-slate-300 text-xs font-medium">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="w-10 h-10 neo-bg rounded-full flex items-center justify-center neo-shadow transition-colors text-slate-500 dark:text-slate-300 active:neo-inner"
                  title="Toggle Theme"
                >
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-10 h-10 neo-bg rounded-full flex items-center justify-center neo-shadow transition-colors text-slate-500 dark:text-slate-300 active:neo-inner"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex justify-between items-end relative z-10">
              <div>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest mb-2">Total Balance</p>
                <h2 className="text-5xl font-light tracking-tight text-slate-700 dark:text-slate-100">{formatCurrency(totalExpenses)}</h2>
              </div>
              <div className="hidden md:flex flex-col items-end">
                <p className="text-slate-500 dark:text-slate-300 text-sm font-medium mb-4">{user.email}</p>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="w-10 h-10 neo-bg rounded-full flex items-center justify-center neo-shadow text-slate-500 dark:text-slate-300 active:neo-inner"
                    title="Toggle Theme"
                  >
                    {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-10 h-10 neo-bg rounded-full flex items-center justify-center neo-shadow text-slate-500 dark:text-slate-300 active:neo-inner"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* App Install Banner */}
          <div className="hidden md:block px-8 pt-6 pb-0">
             {!window.matchMedia('(display-mode: standalone)').matches && (
               <div className="neo-bg p-4 rounded-2xl neo-shadow-sm flex items-center justify-between border border-amber-500/20">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full neo-inner flex items-center justify-center text-amber-500">
                       <Cat className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-700 dark:text-slate-100 text-sm">Install Neko Ledger</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-300 font-medium">Get the Android or iOS app for the best experience.</p>
                    </div>
                 </div>
                 <div className="flex gap-2">
                    <button className="px-4 py-2 neo-bg text-amber-600 text-xs font-bold rounded-xl neo-shadow active:neo-inner">
                      Install Android App
                    </button>
                    <button className="px-4 py-2 neo-bg text-amber-600 text-xs font-bold rounded-xl neo-shadow active:neo-inner">
                      Install iOS App
                    </button>
                 </div>
               </div>
             )}
          </div>

          <main className="p-5 md:p-8 flex-1 md:overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeTab}
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="w-full max-w-full mx-auto"
              >
                {activeTab === "dashboard" && <Dashboard expenses={expenses} budget={budget} onUpdateBudget={handleUpdateBudget} />}
                {activeTab === "categories" && <Categories expenses={expenses} />}
                {activeTab === "history" && <ExpenseList expenses={expenses} onDelete={deleteExpense} />}
                {activeTab === "charts" && <Charts expenses={expenses} />}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        {/* Add Modal */}
        <AnimatePresence>
          {isAddModalOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-center items-end sm:items-center"
            >
              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="neo-bg w-full max-w-md rounded-t-[2rem] sm:rounded-3xl shadow-2xl overflow-hidden border border-white/50"
              >
                <div className="p-5 flex justify-between items-center border-b border-slate-200/50 dark:border-slate-700/50">
                  <h3 className="font-bold text-xl px-2 text-slate-700 dark:text-slate-100">New Transaction</h3>
                  <button 
                    onClick={() => setIsAddModalOpen(false)}
                    className="p-2.5 neo-bg rounded-full text-slate-500 dark:text-slate-300 hover:text-amber-500 neo-shadow transition-all active:neo-inner"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-2 pb-safe">
                  <ExpenseForm onAdd={addExpense} />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AiChat expenses={expenses} budget={budget} />
      </div>
    </div>
  );
}

