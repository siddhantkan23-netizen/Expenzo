import { useState } from "react";
import { Expense } from "../types";
import { formatCurrency } from "../lib/utils";
import { format } from "date-fns";
import { Trash2, Coffee, Bus, Zap, Film, ShoppingBag, Heart, MoreHorizontal, Search, Receipt, Download, Repeat, TrendingDown, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
}

const CategoryIcon = ({ category }: { category: string }) => {
  switch (category) {
    case "Food": return <Coffee className="w-5 h-5 text-amber-500" />;
    case "Transport": return <Bus className="w-5 h-5 text-blue-500" />;
    case "Utilities": return <Zap className="w-5 h-5 text-yellow-500" />;
    case "Entertainment": return <Film className="w-5 h-5 text-purple-500" />;
    case "Shopping": return <ShoppingBag className="w-5 h-5 text-pink-500" />;
    case "Health": return <Heart className="w-5 h-5 text-rose-500" />;
    default: return <MoreHorizontal className="w-5 h-5 text-slate-500 dark:text-slate-300" />;
  }
};

export default function ExpenseList({ expenses, onDelete }: ExpenseListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  const categories = ["All", ...Array.from(new Set(expenses.map(e => e.category)))];

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Financial Report", 14, 15);
    
    const tableData = expenses.map((e) => [
      format(new Date(e.date), "MMM dd, yyyy"),
      e.type === "income" ? "Income" : "Expense",
      e.category,
      e.description || "-",
      e.isRecurring ? "Yes" : "No",
      formatCurrency(e.amount)
    ]);

    autoTable(doc, {
      head: [["Date", "Type", "Category", "Description", "Recurring", "Amount"]],
      body: tableData,
      startY: 20,
    });

    doc.save("financial_report.pdf");
    setIsExportMenuOpen(false);
  };

  const handleExportExcel = () => {
    const data = expenses.map(e => ({
      Date: format(new Date(e.date), "yyyy-MM-dd"),
      Type: e.type === "income" ? "Income" : "Expense",
      Category: e.category,
      Description: e.description || "-",
      Recurring: e.isRecurring ? "Yes" : "No",
      Amount: e.amount
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    
    XLSX.writeFile(wb, "financial_report.xlsx");
    setIsExportMenuOpen(false);
  };

  if (expenses.length === 0) {
    return (
      <div className="neo-bg p-10 rounded-3xl neo-shadow text-center mt-2 flex flex-col items-center justify-center">
        <div className="w-16 h-16 neo-inner rounded-2xl flex items-center justify-center mb-4 text-slate-400 dark:text-slate-400">
          <Receipt className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white-700 dark:text-slate-100 mb-2 tracking-tight">No transactions yet</h2>
        <p className="text-slate-500 dark:text-slate-300 text-sm font-medium">Your recent expenses will appear here.</p>
      </div>
    );
  }

  const filteredExpenses = expenses.filter(
    (e) => {
      const matchesSearch = (e.description && e.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            e.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === "All" || e.category === filterCategory;
      return matchesSearch && matchesCategory;
    }
  );

  const sortedExpenses = [...filteredExpenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="neo-bg rounded-3xl neo-shadow flex flex-col mt-2 overflow-hidden">
      <div className="p-5 border-b border-slate-200/50 dark:border-slate-700/50 flex flex-col gap-4 neo-bg z-10 sticky top-0">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-white-700 dark:text-slate-100 text-lg">Transactions</h3>
          <div className="relative">
            <button 
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="flex items-center gap-2 text-sm font-semibold text-amber-600 neo-bg neo-shadow-sm active:neo-inner-sm px-3 py-1.5 rounded-xl transition-all"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <AnimatePresence>
              {isExportMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsExportMenuOpen(false)}></div>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute right-0 top-full mt-2 w-32 neo-bg neo-shadow rounded-xl overflow-hidden z-20"
                  >
                    <button onClick={handleExportPDF} className="w-full text-left px-4 py-2.5 text-sm font-medium text-white-700 dark:text-slate-100 hover:neo-inner transition-colors">
                      PDF Document
                    </button>
                    <button onClick={handleExportExcel} className="w-full text-left px-4 py-2.5 text-sm font-medium text-white-700 dark:text-slate-100 hover:neo-inner transition-colors">
                      Excel file
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="relative group flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors">
              <Search className="h-4 w-4 text-slate-400 dark:text-slate-400 group-focus-within:text-amber-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 neo-bg neo-inner rounded-xl text-sm outline-none transition-all text-white-700 dark:text-slate-100 placeholder:text-slate-400 dark:text-slate-400 focus:text-amber-600"
            />
          </div>
          <div className="w-1/3">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2.5 neo-bg neo-shadow-sm rounded-xl text-sm outline-none transition-all appearance-none text-white-700 dark:text-slate-100 font-medium active:neo-inner-sm focus:neo-inner"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="flex-1 px-5 pb-5 pt-2 min-h-[300px]">
        <AnimatePresence mode="popLayout">
          {sortedExpenses.length > 0 ? (
            sortedExpenses.map((expense, i) => (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
              key={expense.id} 
              className="flex items-center justify-between py-4 group hover:neo-inner -mx-2 px-4 rounded-2xl transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full neo-bg flex items-center justify-center shrink-0 neo-shadow group-hover:neo-inner transition-all duration-300">
                  {expense.type === "income" ? <TrendingUp className="w-5 h-5 text-emerald-500" /> : <CategoryIcon category={expense.category} />}
                </div>
                <div>
                  <p className="text-sm font-bold text-white-700 dark:text-slate-100 mb-0.5 flex items-center gap-2">
                    {expense.description || expense.category}
                    {expense.isRecurring && <Repeat className="w-3 h-3 text-amber-500" />}
                  </p>
                  <p className="text-[11px] font-medium text-slate-400 dark:text-slate-400 flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 neo-bg neo-shadow-sm rounded text-slate-500 dark:text-slate-300">{expense.category}</span>
                    <span>{format(new Date(expense.date), "MMM dd, yyyy")}</span>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className={`font-bold text-sm tracking-tight ${expense.type === "income" ? "text-emerald-500" : "text-white-700 dark:text-slate-100"}`}>
                  {expense.type === "income" ? "+" : "-"}{formatCurrency(expense.amount)}
                </span>
                <button
                  onClick={() => onDelete(expense.id)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-400 hover:text-rose-500 hover:neo-inner transition-all md:opacity-0 group-hover:opacity-100 focus:opacity-100"
                  aria-label="Delete expense"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 flex flex-col items-center justify-center text-center text-slate-500 dark:text-slate-300"
            >
              <div className="w-12 h-12 neo-inner rounded-full flex items-center justify-center mb-3 text-slate-400 dark:text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <p className="font-medium text-slate-600 dark:text-slate-200 mb-1">No matches found</p>
              <p className="text-sm text-slate-400 dark:text-slate-400">Try adjusting your search.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
