import { formatCurrency } from "../lib/utils";
import { Expense } from "../types";
import { Coffee, Bus, Zap, Film, ShoppingBag, Heart, MoreHorizontal, Grid } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CategoriesProps {
  expenses: Expense[];
}

const CategoryIcon = ({ category }: { category: string }) => {
  switch (category) {
    case "Food": return <Coffee className="w-5 h-5 text-amber-600" />;
    case "Transport": return <Bus className="w-5 h-5 text-blue-600" />;
    case "Utilities": return <Zap className="w-5 h-5 text-yellow-600" />;
    case "Entertainment": return <Film className="w-5 h-5 text-purple-600" />;
    case "Shopping": return <ShoppingBag className="w-5 h-5 text-pink-600" />;
    case "Health": return <Heart className="w-5 h-5 text-rose-600" />;
    default: return <MoreHorizontal className="w-5 h-5 text-slate-500" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "Food": return "bg-amber-100 text-amber-700";
    case "Transport": return "bg-blue-100 text-blue-700";
    case "Utilities": return "bg-yellow-100 text-yellow-700";
    case "Entertainment": return "bg-purple-100 text-purple-700";
    case "Shopping": return "bg-pink-100 text-pink-700";
    case "Health": return "bg-rose-100 text-rose-700";
    default: return "bg-slate-100 text-slate-700";
  }
};

export default function Categories({ expenses }: CategoriesProps) {
  const categoryData = expenses.reduce((acc, curr) => {
    const existing = acc.find(item => item.name === curr.category);
    if (existing) {
      existing.value += curr.amount;
      existing.count += 1;
    } else {
      acc.push({ name: curr.category, value: curr.amount, count: 1 });
    }
    return acc;
  }, [] as { name: string, value: number, count: number }[]).sort((a, b) => b.value - a.value);

  const totalSpent = categoryData.reduce((sum, item) => sum + item.value, 0);

  if (expenses.length === 0) {
    return (
      <div className="neo-bg p-10 rounded-3xl neo-shadow text-center mt-2 flex flex-col items-center justify-center">
        <div className="w-16 h-16 neo-inner rounded-2xl flex items-center justify-center mb-4 text-slate-400">
          <Grid className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-700 mb-2 tracking-tight">No categories yet</h2>
        <p className="text-slate-500 text-sm font-medium">Add some expenses to see your categories.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-2 pb-6">
      <AnimatePresence>
        {categoryData.map((category, i) => {
          const percentage = totalSpent > 0 ? Math.round((category.value / totalSpent) * 100) : 0;
          
          return (
            <motion.div 
              key={category.name} 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
              className="neo-bg p-5 rounded-3xl neo-shadow transition-all duration-300 group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-full neo-inner flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  <CategoryIcon category={category.name} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-slate-700 tracking-tight">{category.name}</h3>
                    <span className="font-bold text-slate-700">{formatCurrency(category.value)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[11px] text-slate-400 font-medium tracking-wide uppercase">{category.count} {category.count === 1 ? 'transaction' : 'transactions'}</p>
                    <p className="text-[11px] font-bold text-slate-500 px-2 py-0.5 neo-inner-sm rounded-md">{percentage}%</p>
                  </div>
                </div>
              </div>
              <div className="w-full h-2.5 neo-inner-sm rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, delay: 0.2 + (i * 0.1), ease: "easeOut" }}
                  className={`h-full rounded-full ${getCategoryColor(category.name).split(' ')[1].replace('text', 'bg')} relative`}
                >
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
