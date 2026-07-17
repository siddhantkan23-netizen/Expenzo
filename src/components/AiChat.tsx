import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Cat, User } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Expense } from "../types";

interface AiChatProps {
  expenses: Expense[];
  budget: number;
}

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
}

export default function AiChat({ expenses, budget }: AiChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          expenses,
          budget,
        }),
      });

      if (!res.ok) throw new Error("Failed to get response");

      const data = await res.json();
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: data.response || "Sorry, I couldn't process that request.",
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "ai",
          content: "Oops! Something went wrong. Please make sure the OPENROUTER_API_KEY is configured in the environment variables.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-24 md:bottom-8 right-4 sm:right-8 w-14 h-14 neo-bg text-amber-500 rounded-full neo-shadow flex items-center justify-center hover:-translate-y-1 transition-all z-40 active:neo-inner"
            aria-label="Open AI Assistant"
          >
            <Cat className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-24 md:bottom-24 right-4 sm:right-8 w-[calc(100vw-32px)] sm:w-96 h-[500px] max-h-[calc(100vh-140px)] neo-bg rounded-2xl neo-shadow z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="neo-bg px-4 py-3 flex justify-between items-center text-amber-600 shrink-0 border-b border-white/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 neo-inner rounded-full flex items-center justify-center">
                  <Cat className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Expenzo Assistant</h3>
                  <p className="text-[10px] text-amber-600/80">Meow! How can I help?</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:neo-inner rounded-full transition-all active:neo-inner-sm text-slate-500 hover:text-amber-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto neo-bg space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <div className="w-16 h-16 neo-inner rounded-full flex items-center justify-center opacity-60">
                    <Cat className="w-8 h-8 text-slate-400" />
                  </div>
                  <div className="opacity-60 mb-2">
                    <p className="text-sm font-medium text-slate-600">How can I help you?</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-[200px]">Ask me about your budget, spending habits, or how to save money.</p>
                  </div>
                  
                  <div className="flex flex-col gap-2 w-full max-w-[240px]">
                    <button 
                      onClick={() => setInput("Analyze my spending habits and give me personalized savings tips.")}
                      className="text-xs font-medium text-amber-700 bg-amber-50 px-3 py-2 rounded-xl text-left hover:bg-amber-100 transition-colors border border-amber-200"
                    >
                      ✨ Analyze my spending habits
                    </button>
                    <button 
                      onClick={() => setInput("Am I on track with my budget this month?")}
                      className="text-xs font-medium text-amber-700 bg-amber-50 px-3 py-2 rounded-xl text-left hover:bg-amber-100 transition-colors border border-amber-200"
                    >
                      📊 Check my budget status
                    </button>
                  </div>
                </div>
              )}
              
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                      msg.role === "user"
                        ? "neo-bg neo-shadow text-amber-700 rounded-br-sm border border-white/30"
                        : "neo-bg neo-inner text-white-700 rounded-bl-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="neo-bg neo-inner rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.3s]"></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 neo-bg shrink-0 border-t border-white/50 relative z-10">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2 relative"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your finances..."
                  className="flex-1 pl-4 pr-10 py-3 neo-bg neo-inner rounded-xl outline-none transition-all text-sm text-white-700 focus:text-amber-600 placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 p-1.5 text-amber-500 hover:neo-inner rounded-lg disabled:opacity-50 transition-all active:neo-inner-sm"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
