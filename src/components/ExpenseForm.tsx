import { useState, FormEvent } from "react";
import { CATEGORIES, Expense } from "../types";
import { IndianRupee } from "lucide-react";
import { motion } from "motion/react";

interface ExpenseFormProps {
  onAdd: (expense: Omit<Expense, "id">) => void;
}

export default function ExpenseForm({ onAdd }: ExpenseFormProps) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [type, setType] = useState<"expense" | "income">("expense");
  const [isRecurring, setIsRecurring] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;

    onAdd({
      amount: Number(amount),
      category: category === "Add New..." ? customCategory.trim() || "Other" : category,
      description,
      date: new Date(date).toISOString(),
      type,
      isRecurring,
    });

    setAmount("");
    setDescription("");
    setCustomCategory("");
    setIsRecurring(false);
  };

  return (
    <div className="neo-bg p-4 sm:p-6 rounded-[2rem] w-full">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex bg-slate-200/50 neo-inner rounded-xl p-1 mb-4">
          <button
            type="button"
            onClick={() => setType("expense")}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
              type === "expense" 
                ? "neo-bg neo-shadow text-amber-600" 
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setType("income")}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
              type === "income" 
                ? "neo-bg neo-shadow text-emerald-600" 
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Income
          </button>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Amount</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <IndianRupee className="h-5 w-5 text-amber-500" />
            </div>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 neo-bg neo-inner rounded-2xl outline-none transition-all font-semibold text-slate-700 text-lg placeholder:text-slate-400 focus:text-amber-600"
              placeholder="0.00"
              autoFocus
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-4 py-3.5 neo-bg neo-inner rounded-2xl outline-none transition-all appearance-none font-semibold text-slate-700 focus:text-amber-600"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="Add New...">Add New...</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3.5 neo-bg neo-inner rounded-2xl outline-none transition-all font-semibold text-slate-700 focus:text-amber-600"
            />
          </div>
        </div>

        {category === "Add New..." && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
          >
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Custom Category</label>
            <input
              type="text"
              required
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              className="w-full px-4 py-3.5 neo-bg neo-inner rounded-2xl outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400 focus:text-amber-600"
              placeholder="e.g. Subscriptions"
            />
          </motion.div>
        )}

        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3.5 neo-bg neo-inner rounded-2xl outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400 focus:text-amber-600"
            placeholder="e.g. Lunch with friends"
          />
        </div>

        <div className="flex items-center gap-3 mt-4 px-1 cursor-pointer" onClick={() => setIsRecurring(!isRecurring)}>
          <div className="w-5 h-5 neo-inner rounded flex items-center justify-center text-amber-500 p-0.5">
             <div className={`w-full h-full rounded-sm bg-amber-500 transition-transform ${isRecurring ? 'scale-100' : 'scale-0'} neo-shadow-sm`}></div>
          </div>
          <span className="text-slate-500 font-medium text-sm select-none">Recurring Transaction</span>
        </div>

        <button
          type="submit"
          className="w-full mt-6 neo-bg text-amber-600 font-bold py-4 px-4 rounded-2xl transition-all neo-shadow text-lg active:neo-inner hover:text-amber-700 tracking-tight"
        >
          Save Transaction
        </button>
      </form>
    </div>
  );
}
