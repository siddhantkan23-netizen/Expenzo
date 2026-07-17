import { useState } from "react";
import { formatCurrency } from "../lib/utils";
import { Expense } from "../types";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownRight, Target, Check, Edit2, X, Trash2 } from "lucide-react";

interface DashboardProps {
  expenses: Expense[];
  budget: number;
  onUpdateBudget: (newBudget: number) => void;
  onDelete: (id: string) => void;
}

export default function Dashboard({ expenses, budget, onUpdateBudget, onDelete }: DashboardProps) {
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState(budget.toString());

  const recentExpenses = [...expenses]
    .filter(e => e.type !== "income")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);
    
  const totalSpent = expenses.filter(e => e.type !== "income").reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = expenses.filter(e => e.type === "income").reduce((sum, e) => sum + e.amount, 0);
  
  const budgetPercentage = budget > 0 ? Math.min(Math.round((totalSpent / budget) * 100), 100) : 0;
  const isOverBudget = totalSpent >= budget && budget > 0;
  const isNearBudget = !isOverBudget && budgetPercentage >= 80 && budget > 0;

  const handleSaveBudget = () => {
    const val = Number(tempBudget);
    if (!isNaN(val) && val >= 0) {
      onUpdateBudget(val);
    }
    setIsEditingBudget(false);
  };

  return (
    <div className="space-y-6 mt-2">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="neo-bg p-5 rounded-3xl neo-shadow transition-all duration-300 group">
          <div className="w-10 h-10 rounded-2xl neo-shadow flex items-center justify-center mb-4 text-emerald-500">
            <ArrowDownRight className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest mb-1">Total Income</p>
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-100 tracking-tight">{formatCurrency(totalIncome)}</h3>
        </div>
        <div className="neo-bg p-5 rounded-3xl neo-shadow transition-all duration-300 group">
          <div className="w-10 h-10 rounded-2xl neo-shadow flex items-center justify-center mb-4 text-rose-500">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest mb-1">Total Spent</p>
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-100 tracking-tight">{formatCurrency(totalSpent)}</h3>
        </div>
      </div>

      {/* Budget Tracker */}
      <div className="neo-bg p-6 rounded-3xl neo-shadow relative group transition-all duration-300">
        <div className="flex justify-between items-center mb-6 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full neo-inner flex items-center justify-center">
              <Target className="w-4 h-4 text-amber-500" />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate-100">Monthly Budget</h3>
            {isOverBudget && (
              <span className="ml-2 text-[10px] font-bold px-2 py-1 bg-rose-100 text-rose-600 rounded-lg">OVER BUDGET</span>
            )}
            {isNearBudget && (
              <span className="ml-2 text-[10px] font-bold px-2 py-1 bg-amber-100 text-amber-600 rounded-lg">NEAR BUDGET</span>
            )}
          </div>
          {!isEditingBudget ? (
            <button 
              onClick={() => {
                setTempBudget(budget.toString());
                setIsEditingBudget(true);
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-300 hover:text-amber-500 neo-shadow active:neo-inner transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsEditingBudget(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-300 hover:text-rose-500 neo-shadow active:neo-inner transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <button 
                onClick={handleSaveBudget}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-300 hover:text-emerald-500 neo-shadow active:neo-inner transition-colors"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        
        {isEditingBudget ? (
          <div className="mb-5 relative z-10">
            <input
              type="number"
              value={tempBudget}
              onChange={(e) => setTempBudget(e.target.value)}
              className="w-full px-4 py-3 neo-bg rounded-xl neo-inner outline-none text-slate-700 dark:text-slate-100 font-medium transition-all"
              placeholder="Enter budget amount"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveBudget();
                if (e.key === 'Escape') setIsEditingBudget(false);
              }}
            />
          </div>
        ) : (
          <div className="flex justify-between items-end mb-4 relative z-10">
            <div>
              <p className="text-4xl font-light text-slate-900 tracking-tight">{formatCurrency(totalSpent)}</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-300 mt-1">
                of {formatCurrency(budget)} limit
              </p>
            </div>
            <div className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${isOverBudget ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-200'}`}>
              {budgetPercentage}%
            </div>
          </div>
        )}
        
        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative z-10">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out relative ${isOverBudget ? 'bg-rose-500' : isNearBudget ? 'bg-amber-600' : 'bg-gradient-to-r from-emerald-500 to-emerald-400'}`}
            style={{ width: `${budgetPercentage}%` }}
          >
             {!isOverBudget && <div className="absolute top-0 right-0 bottom-0 w-10 bg-gradient-to-r from-transparent to-white/30 rounded-full"></div>}
          </div>
        </div>
        <div className="relative z-10">
          {isOverBudget && !isEditingBudget && (
            <p className="text-xs text-rose-500 mt-3 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
              Exceeded budget by {formatCurrency(totalSpent - budget)}
            </p>
          )}
          {isNearBudget && !isEditingBudget && (
            <p className="text-xs text-amber-600 mt-3 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
              Approaching budget limit. {formatCurrency(budget - totalSpent)} left.
            </p>
          )}
          {!isOverBudget && !isNearBudget && budget > 0 && !isEditingBudget && (
            <p className="text-xs text-slate-500 dark:text-slate-300 mt-3 flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {formatCurrency(budget - totalSpent)} remaining
            </p>
          )}
        </div>
      </div>

      {/* Monthly Report Summary */}
      {expenses.length > 0 && (
        <div className="neo-bg rounded-3xl neo-inner p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
             <Target className="w-24 h-24 text-slate-900" />
          </div>
          <div className="relative z-10">
            <h3 className="font-bold text-slate-700 dark:text-slate-100 tracking-tight mb-2">Monthly Insight</h3>
            <p className="text-sm text-slate-500 dark:text-slate-300 font-medium leading-relaxed">
              You have spent <strong>{formatCurrency(totalSpent)}</strong> this month across <strong>{expenses.length}</strong> transactions. 
              {isOverBudget 
                ? " You've exceeded your budget. Consider cutting back on non-essentials." 
                : " You're on track to stay within your budget!"}
            </p>
          </div>
        </div>
      )}

      {/* Recent Activity Mini */}
      <div className="neo-bg rounded-3xl neo-shadow p-6 transition-all duration-300">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-bold text-slate-700 dark:text-slate-100 tracking-tight">Recent Transactions</h3>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 neo-inner px-2.5 py-1 rounded-full">Last 3</span>
        </div>
        {recentExpenses.length > 0 ? (
          <div className="space-y-5">
            {recentExpenses.map((expense) => (
              <div key={expense.id} className="flex justify-between items-center group -mx-2 px-2 py-1 rounded-xl hover:neo-inner transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full neo-inner group-hover:bg-amber-400 transition-colors"></div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-100 tracking-tight">{expense.description || expense.category}</p>
                    <p className="text-[11px] font-medium text-slate-400 dark:text-slate-400 mt-0.5">{format(new Date(expense.date), "MMM dd")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-100 tracking-tight">{formatCurrency(expense.amount)}</span>
                  <button
                    onClick={() => onDelete(expense.id)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-400 hover:text-rose-500 hover:neo-inner transition-all md:opacity-0 group-hover:opacity-100 focus:opacity-100"
                    aria-label="Delete expense"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 flex flex-col items-center justify-center text-center neo-inner rounded-2xl">
             <p className="text-sm text-slate-500 dark:text-slate-300 font-medium">No recent transactions</p>
          </div>
        )}
      </div>
    </div>
  );
}

