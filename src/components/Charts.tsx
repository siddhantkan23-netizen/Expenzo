import { formatCurrency } from "../lib/utils";
import { Expense } from "../types";
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";
import { motion } from "motion/react";

interface ChartsProps {
  expenses: Expense[];
}

const COLORS = ['#d97706', '#f59e0b', '#fbbf24', '#fcd34d', '#fde68a', '#fef3c7'];

export default function Charts({ expenses }: ChartsProps) {
  const categoryData = expenses
    .filter(e => e.type !== "income")
    .reduce((acc, curr) => {
      const existing = acc.find(item => item.name === curr.category);
      if (existing) {
        existing.value += curr.amount;
      } else {
        acc.push({ name: curr.category, value: curr.amount });
      }
      return acc;
    }, [] as { name: string, value: number }[]).sort((a, b) => b.value - a.value);

  const monthlyData = expenses.reduce((acc, curr) => {
    const monthStr = format(new Date(curr.date), "MMM yyyy");
    const existing = acc.find(item => item.name === monthStr);
    
    if (existing) {
      if (curr.type === "income") existing.income += curr.amount;
      else existing.expense += curr.amount;
    } else {
      acc.push({
        name: monthStr,
        income: curr.type === "income" ? curr.amount : 0,
        expense: curr.type === "income" ? 0 : curr.amount,
        timestamp: new Date(curr.date).getTime() // For sorting
      });
    }
    return acc;
  }, [] as { name: string, income: number, expense: number, timestamp: number }[])
  .sort((a, b) => a.timestamp - b.timestamp);

  const dateData = [...expenses]
    .filter(e => e.type !== "income")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 30)
    .reduce((acc, curr) => {
      const dateStr = format(new Date(curr.date), "MMM dd");
      const existing = acc.find(item => item.name === dateStr);
      if (existing) {
        existing.total += curr.amount;
      } else {
        acc.push({ name: dateStr, total: curr.amount });
      }
      return acc;
    }, [] as { name: string, total: number }[]).reverse();

  if (expenses.length === 0) {
    return (
      <div className="neo-bg p-10 rounded-3xl neo-shadow text-center mt-2 flex flex-col items-center justify-center">
        <div className="w-16 h-16 neo-inner rounded-2xl flex items-center justify-center mb-4 text-slate-400">
          <PieChartIcon className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-700 mb-2 tracking-tight">No data yet</h2>
        <p className="text-slate-500 text-sm font-medium">Add some expenses to see your charts.</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 mt-2 pb-6"
    >
      <div className="neo-bg p-6 rounded-3xl neo-shadow flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-slate-700 tracking-tight">Expenses by Category</h3>
        </div>
        <div className="h-64 relative">
          <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
            <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Total</span>
            <span className="text-xl font-bold text-slate-700">{formatCurrency(expenses.reduce((a, b) => a + b.amount, 0))}</span>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={95}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: '#e6e9ef', boxShadow: '8px 8px 16px #c8cbd1, -8px -8px 16px #ffffff', padding: '12px 16px' }}
                itemStyle={{ color: '#334155', fontWeight: 600 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-y-4 gap-x-2">
          {categoryData.slice(0, 6).map((cat, i) => (
            <div key={cat.name} className="flex items-center gap-2.5 text-sm p-2 rounded-xl hover:neo-inner transition-all">
              <span className="w-3.5 h-3.5 rounded-full neo-shadow flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
              <span className="text-slate-700 font-medium truncate flex-1">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="neo-bg p-6 rounded-3xl neo-shadow flex flex-col">
        <h3 className="font-bold mb-6 text-slate-700 tracking-tight">Monthly Report</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#c8cbd1" opacity={0.5} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} 
                dy={15}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                tickFormatter={(value) => `₹${value}`}
                width={50}
              />
              <Tooltip
                formatter={(value: number, name: string) => [formatCurrency(value), name === 'income' ? 'Income' : 'Expense']}
                cursor={{ fill: '#e6e9ef', opacity: 0.5 }}
                contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: '#e6e9ef', boxShadow: '8px 8px 16px #c8cbd1, -8px -8px 16px #ffffff', padding: '12px 16px' }}
                itemStyle={{ fontWeight: 700 }}
                labelStyle={{ color: '#64748b', marginBottom: '4px', fontSize: '12px' }}
              />
              <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={30} />
              <Bar dataKey="expense" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="neo-bg p-6 rounded-3xl neo-shadow flex flex-col">
        <h3 className="font-bold mb-6 text-slate-700 tracking-tight">Recent Spending</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dateData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#c8cbd1" opacity={0.5} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} 
                dy={15}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                tickFormatter={(value) => `₹${value}`}
                width={50}
              />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), "Spent"]}
                cursor={{ fill: '#e6e9ef', opacity: 0.5 }}
                contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: '#e6e9ef', boxShadow: '8px 8px 16px #c8cbd1, -8px -8px 16px #ffffff', padding: '12px 16px' }}
                itemStyle={{ color: '#d97706', fontWeight: 700 }}
                labelStyle={{ color: '#64748b', marginBottom: '4px', fontSize: '12px' }}
              />
              <Bar dataKey="total" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
