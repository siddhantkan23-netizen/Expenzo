import { useState, FormEvent, useEffect } from "react";
import { Lock, Mail, UserPlus, LogIn, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AuthProps {
  onLogin: (user: any) => void;
}

export default function Auth({ onLogin }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      onLogin(data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full md:max-w-6xl mx-auto relative overflow-hidden neo-bg">
      
      {/* Decorative circles to mimic the background shapes in the image, but styled neumorphically */}
      <div className="absolute top-[-5%] left-[-10%] md:left-[-5%] md:top-[-10%] w-64 h-64 md:w-96 md:h-96 neo-shadow rounded-full opacity-40"></div>
      <div className="absolute top-[10%] right-[-15%] md:right-auto md:left-[20%] w-48 h-48 md:w-72 md:h-72 neo-inner rounded-full opacity-40"></div>
      
      {/* Back button */}
      <div className="absolute top-8 left-6 z-10 flex items-center gap-2">
         <button className="w-10 h-10 neo-bg rounded-full flex items-center justify-center neo-shadow active:neo-inner text-slate-500 transition-all">
           <ChevronLeft className="w-5 h-5" />
         </button>
         <span className="text-slate-500 font-bold text-sm hidden sm:inline">Back</span>
      </div>

      {/* Header Text - Takes half screen on desktop */}
      <div className="pt-32 pb-10 px-8 flex-1 flex flex-col justify-center relative z-10 md:w-1/2 md:p-16">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-700 tracking-tight mb-4 text-center md:text-left">
            {isLogin ? "Welcome back!" : "Get Started"}
          </h1>
          <p className="text-slate-500 text-sm md:text-base font-medium leading-relaxed text-center md:text-left px-4 md:px-0 max-w-sm mx-auto md:mx-0">
            {isLogin ? "Enter personal details to access your employee account" : "Enter your personal details to get started with your account"}
          </p>
        </motion.div>
      </div>

      {/* Form Container */}
      <div className="w-full md:w-1/2 flex items-center p-0 md:p-8">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full h-full md:h-auto neo-bg rounded-t-[3rem] md:rounded-[2.5rem] p-8 pb-12 neo-shadow relative z-20"
        >
          {/* Top Tabs inside the card (Skeuomorphic/Neumorphic style) */}
          <div className="flex bg-slate-200/50 neo-inner rounded-2xl p-1 mb-8 max-w-sm mx-auto">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setError("");
              }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                isLogin 
                  ? "neo-bg neo-shadow text-amber-600" 
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setError("");
              }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                !isLogin 
                  ? "neo-bg neo-shadow text-amber-600" 
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 max-w-sm mx-auto">
            {!isLogin && (
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-5 py-4 neo-bg neo-inner rounded-2xl outline-none transition-all font-semibold text-slate-700 text-sm focus:text-amber-600 placeholder:text-slate-400"
                  placeholder="Enter Full Name"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 neo-bg neo-inner rounded-2xl outline-none transition-all font-semibold text-slate-700 text-sm focus:text-amber-600 placeholder:text-slate-400"
                placeholder="Enter Email"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 neo-bg neo-inner rounded-2xl outline-none transition-all font-semibold text-slate-700 text-sm focus:text-amber-600 placeholder:text-slate-400"
                placeholder="Enter Password"
              />
            </div>

            {/* Remember me & Forgot Password */}
            <div className="flex items-center justify-between text-sm px-1">
               <label className="flex items-center gap-3 cursor-pointer group" onClick={() => setRememberMe(!rememberMe)}>
                  <div className="w-5 h-5 neo-inner rounded flex items-center justify-center text-amber-500 p-0.5">
                     <div className={`w-full h-full rounded-sm bg-amber-500 transition-transform ${rememberMe ? 'scale-100' : 'scale-0'} neo-shadow-sm`}></div>
                  </div>
                  <span className="text-slate-500 font-medium select-none">{isLogin ? "Remember me" : "I agree to the processing of Personal data"}</span>
               </label>
               {isLogin && (
                 <button type="button" className="text-amber-600 font-bold hover:underline">
                   Forgot password?
                 </button>
               )}
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-rose-500 text-xs font-semibold text-center bg-rose-50 py-2 rounded-lg"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full neo-bg text-amber-600 font-bold py-4 px-4 rounded-2xl transition-all neo-shadow active:neo-inner text-base flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-amber-600/30 border-t-amber-600 rounded-full animate-spin"></div>
              ) : (
                <>{isLogin ? "Sign in" : "Sign up"}</>
              )}
            </button>
          </form>

          <div className="mt-8 max-w-sm mx-auto">
             <p className="text-center text-sm font-medium text-slate-500">
               {isLogin ? "Don't have an account? " : "Already have an account? "}
               <button
                 type="button"
                 onClick={() => {
                   setIsLogin(!isLogin);
                   setError("");
                 }}
                 className="text-amber-600 font-bold hover:underline"
               >
                 {isLogin ? "Sign up" : "Sign in"}
               </button>
             </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

