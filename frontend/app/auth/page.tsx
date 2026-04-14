"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { generateState, generateCodeVerifier, generateCodeChallenge } from "@/lib/pkce";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  
  const { login, signup } = useAuth();
  
  const handleGoogleLogin = async () => {
    try {
      const state = generateState();
      const verifier = generateCodeVerifier();
      const challenge = await generateCodeChallenge(verifier);

      sessionStorage.setItem("google_oauth_state", state);
      sessionStorage.setItem("google_oauth_verifier", verifier);

      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!clientId) {
        setError("Google Client ID is missing.");
        return;
      }

      const redirectUri = `${window.location.origin}/auth/callback`;
      
      const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      url.searchParams.append("client_id", clientId);
      url.searchParams.append("redirect_uri", redirectUri);
      url.searchParams.append("response_type", "code");
      url.searchParams.append("scope", "openid email profile");
      url.searchParams.append("state", state);
      url.searchParams.append("code_challenge", challenge);
      url.searchParams.append("code_challenge_method", "S256");
      // Optional: prompt="select_account" to always show account picker
      url.searchParams.append("prompt", "select_account");

      window.location.href = url.toString();
    } catch (err: any) {
      setError("Failed to initiate Google Login.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(name, email, password);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Authentication failed.");
    }
  };

  return (
    <div className="pt-32 pb-24 px-4 min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-[420px]"
      >
        <div className="volumetric-glass-card p-8 md:p-10 relative overflow-hidden">
          {/* Subtle Accent Glow Behind Card */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-[var(--accent)] opacity-20 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-[var(--cyan)] opacity-10 blur-[80px] rounded-full pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-2">
              <span>{isLogin ? "Welcome Back" : "Create Account"}</span>
            </h2>
            <p className="text-[var(--text-tertiary)] text-sm mb-8">
              {isLogin ? "Log in to duel your peers and track progress." : "Sign up to start tracking your LeetCode power ranking."}
            </p>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <AnimatePresence mode="popLayout">
                {!isLogin && (
                  <motion.div
                    key="name"
                    initial={{ opacity: 0, x: -20, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: "auto" }}
                    exit={{ opacity: 0, x: -20, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <input
                      type="text"
                      className="glass-input"
                      placeholder="Display Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={!isLogin}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <input
                type="email"
                className="glass-input"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              
              <input
                type="password"
                className="glass-input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button type="submit" className="glass-button w-full mt-4 !py-3">
                {isLogin ? "Sign In" : "Sign Up"}
              </button>
            </form>

            <div className="mt-6 flex items-center gap-4">
              <div className="h-px bg-white/10 flex-1"></div>
              <span className="text-xs text-white/40 uppercase tracking-widest">OR</span>
              <div className="h-px bg-white/10 flex-1"></div>
            </div>

            <button
              onClick={() => handleGoogleLogin()}
              type="button"
              className="mt-6 w-full relative p-[1px] rounded-[100px] bg-gradient-to-r from-[rgba(255,255,255,0.15)] to-[rgba(255,255,255,0.05)] overflow-hidden group transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="relative px-6 py-3 bg-[var(--google-btn-bg)] backdrop-blur-xl rounded-[100px] flex items-center justify-center gap-3 w-full h-full transition-all duration-300 group-hover:bg-[var(--google-btn-bg-hover)]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="font-semibold text-[14px] tracking-wide text-[var(--text-primary)] opacity-90">Continue with Google</span>
              </div>
            </button>

            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                }}
                className="text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
