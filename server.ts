import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { User, Expense } from "./models";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // Connect to MongoDB
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("MongoDB connection error:", error);
    }
  } else {
    console.warn("MONGODB_URI is not set in environment variables");
  }

  const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";

  // Auth Middleware
  const requireAuth = async (req: any, res: any, next: any) => {
    try {
      const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
      if (!token) return res.status(401).json({ error: "Unauthorized" });

      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.userId = decoded.userId;
      next();
    } catch (error) {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    if (!process.env.MONGODB_URI) return res.status(500).json({ error: "MongoDB not configured" });
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: "Missing fields" });

      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ error: "User already exists" });

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ email, password: hashedPassword });
      await user.save();

      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });
      res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" });
      res.status(201).json({ user: { id: user._id, email: user.email, budget: user.budget } });
    } catch (error) {
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    if (!process.env.MONGODB_URI) return res.status(500).json({ error: "MongoDB not configured" });
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ error: "Invalid credentials" });

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) return res.status(401).json({ error: "Invalid credentials" });

      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });
      res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" });
      res.json({ user: { id: user._id, email: user.email, budget: user.budget } });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.get("/api/auth/me", requireAuth, async (req: any, res: any) => {
    try {
      const user = await User.findById(req.userId);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json({ user: { id: user._id, email: user.email, budget: user.budget } });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ success: true });
  });

  app.put("/api/budget", requireAuth, async (req: any, res: any) => {
    try {
      const { budget } = req.body;
      const user = await User.findByIdAndUpdate(req.userId, { budget }, { new: true });
      res.json({ budget: user?.budget });
    } catch (error) {
      res.status(500).json({ error: "Failed to update budget" });
    }
  });

  // Expense Routes
  app.get("/api/expenses", requireAuth, async (req: any, res: any) => {
    try {
      const expenses = await Expense.find({ user: req.userId }).sort({ date: -1 });
      res.json(expenses.map(e => ({
        id: e._id,
        amount: e.amount,
        category: e.category,
        description: e.description,
        date: e.date
      })));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch expenses" });
    }
  });

  app.post("/api/expenses", requireAuth, async (req: any, res: any) => {
    try {
      const { amount, category, description, date } = req.body;
      if (!amount || !category || !date) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      const newExpense = new Expense({
        user: req.userId,
        amount: Number(amount),
        category,
        description: description || "",
        date,
      });
      await newExpense.save();
      
      res.status(201).json({
        id: newExpense._id,
        amount: newExpense.amount,
        category: newExpense.category,
        description: newExpense.description,
        date: newExpense.date
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to create expense" });
    }
  });

  app.delete("/api/expenses/:id", requireAuth, async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const deleted = await Expense.findOneAndDelete({ _id: id, user: req.userId });
      if (deleted) {
        res.status(200).json({ success: true });
      } else {
        res.status(404).json({ error: "Expense not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete expense" });
    }
  });

  app.post("/api/chat", requireAuth, async (req: any, res: any) => {
    const { message, expenses, budget } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Missing message" });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "OPENROUTER_API_KEY is not set" });
    }

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
          "X-Title": "Ledger App AI Assistant"
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          max_tokens: 1000,
          messages: [
            {
              role: "system",
              content: `You are an AI financial assistant for a personal finance app called Ledger.
The user has a monthly budget of ${budget} INR.
Here is the user's expense data in JSON format: ${JSON.stringify(expenses)}.
Answer the user's questions about their finances, give tips on how to save money, and provide analysis based on the provided data. Keep responses concise, helpful, and in plain text or simple markdown.`
            },
            {
              role: "user",
              content: message
            }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenRouter API error:", errorText);
        return res.status(response.status).json({ error: "Failed to fetch response from OpenRouter API" });
      }

      const data = await response.json();
      res.json({ response: data.choices[0].message.content });
    } catch (error) {
      console.error("Chat API error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
