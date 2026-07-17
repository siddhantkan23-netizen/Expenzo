export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export type Category = 
  | "Food"
  | "Transport"
  | "Utilities"
  | "Entertainment"
  | "Shopping"
  | "Health"
  | "Other";

export const CATEGORIES: Category[] = [
  "Food",
  "Transport",
  "Utilities",
  "Entertainment",
  "Shopping",
  "Health",
  "Other",
];
