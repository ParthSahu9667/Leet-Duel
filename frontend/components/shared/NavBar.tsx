"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { GlassButton } from "./GlassButton";
import { Moon, Sun } from "lucide-react";

export const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
      className={`fixed left-1/2 -translate-x-1/2 h-[56px] flex items-center justify-between px-[28px] rounded-full border transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] z-[100] backdrop-blur-xl ${
        scrolled
          ? "w-[95%] max-w-[1200px] top-[12px] bg-[var(--glass)] border-[var(--glass-border)] shadow-[var(--card-shadow)]"
          : "w-[90%] max-w-[900px] top-[24px] bg-[var(--glass)] border-[var(--glass-border)] shadow-[var(--card-shadow)]"
      }`}
    >
      {/* Left: Logo */}
      <Link href="/" className="flex items-center gap-2">
        <span className="font-extrabold tracking-tight text-[var(--text-primary)] text-[16px] cursor-pointer">
          LeetDuel
        </span>
      </Link>

      {/* Center: Navigation Links */}
      <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-[24px] text-[14px] text-[var(--text-secondary)] font-medium">
        <Link href="/" className="hover:text-[var(--text-primary)] transition-colors cursor-pointer">
          Home
        </Link>
        <Link href="/compete" className="hover:text-[var(--text-primary)] transition-colors cursor-pointer">
          Compete
        </Link>
      </div>

      {/* Right: Theme Toggle & Auth Buttons */}
      <div className="flex items-center gap-[12px]">
        {/* Theme Toggle within a small glass pill */}
        <div className="flex items-center bg-[var(--glass-strong)] border border-[var(--glass-border)] rounded-full p-1 shadow-sm">
          <button
            onClick={toggleTheme}
            className={`w-8 h-8 flex justify-center items-center rounded-full transition-all duration-300 ${theme === 'dark' ? 'bg-[var(--accent)] shadow-[0_2px_8px_var(--accent-glow)]' : 'bg-transparent'}`}
            aria-label="Switch to dark mode"
          >
            <Moon className={`w-4 h-4 ${theme === 'dark' ? 'text-white' : 'text-[var(--text-secondary)]'}`} />
          </button>
          <button
            onClick={toggleTheme}
            className={`w-8 h-8 flex justify-center items-center rounded-full transition-all duration-300 ${theme === 'light' ? 'bg-[#f59e0b] shadow-[0_2px_8px_rgba(245,158,11,0.35)]' : 'bg-transparent'}`}
            aria-label="Switch to light mode"
          >
            <Sun className={`w-4 h-4 ${theme === 'light' ? 'text-white' : 'text-[var(--text-secondary)]'}`} />
          </button>
        </div>
        {user ? (
          <div className="flex items-center gap-4 ml-2">
            <Link href="/account" className="hover:text-[var(--text-primary)] text-[var(--text-secondary)] font-semibold hidden lg:inline cursor-pointer">
              {user.name}
            </Link>
            <GlassButton onClick={logout} className="!py-2 !px-5 !text-sm !font-semibold" style={{ backgroundColor: theme === 'light' ? 'rgba(255,255,255,0.7)' : undefined }}>
              Sign Out
            </GlassButton>
          </div>
        ) : (
          <GlassButton href="/auth" className="!py-2 !px-5 !text-sm !font-semibold ml-2" style={{ backgroundColor: theme === 'light' ? 'rgba(255,255,255,0.7)' : undefined }}>
            Sign In
          </GlassButton>
        )}
      </div>
    </motion.nav>
  );
};

