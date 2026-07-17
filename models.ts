import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  budget: { type: Number, default: 5000 },
});

export const User = mongoose.model("User", UserSchema);

const ExpenseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  description: { type: String, default: "" },
  date: { type: String, required: true },
});

export const Expense = mongoose.model("Expense", ExpenseSchema);
