"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { GlassButton } from "./GlassButton";

export const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();

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
      className={`fixed left-1/2 -translate-x-1/2 h-[56px] flex items-center justify-between px-[28px] rounded-[100px] border transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] z-[100] backdrop-blur-[30px] ${
        scrolled
          ? "w-[95%] max-w-[1200px] top-[8px] bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.12)] shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
          : "w-[90%] max-w-[700px] top-[20px] bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)]"
      }`}
    >
      <Link href="/" className="flex items-center gap-2">
        <span className="font-semibold tracking-[0.5px] text-white text-[15px] cursor-pointer">
          LeetDuel
        </span>
      </Link>
      <div className="flex items-center gap-[24px] text-[13px] text-white/60 font-medium">
        <Link href="/" className="hidden sm:inline hover:text-white/80 transition-colors cursor-pointer">
          Home
        </Link>
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-white/80 font-semibold">{user.name}</span>
            <GlassButton onClick={logout} className="!py-2 !px-4 !text-xs">
              Sign Out
            </GlassButton>
          </div>
        ) : (
          <GlassButton href="/auth" className="!py-2 !px-4 !text-xs">
            Sign In
          </GlassButton>
        )}
      </div>
    </motion.nav>
  );
};
