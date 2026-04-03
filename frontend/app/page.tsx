"use client";

import { useEffect, useState } from 'react';
import { Dashboard } from "@/components/ui/Dashboard";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="min-h-[200vh] relative">
      <div className="grain"></div>
      <div className="bg-wrapper">
          <div className="liquid-blob"></div>
      </div>

      <nav
        className={`fixed left-1/2 -translate-x-1/2 h-[60px] flex items-center justify-between px-[30px] rounded-[100px] border transition-all duration-[400ms] ease-[cubic-bezier(0.23,1,0.32,1)] z-[100] backdrop-blur-[20px] ${
          scrolled
            ? "w-[95%] top-[10px] bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)]"
            : "w-[90%] max-w-[800px] top-[20px] bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)]"
        }`}
      >
        <div className="font-semibold tracking-[1px] text-white">LeetCode Comparison</div>
        <div className="flex gap-[20px] text-[13px] opacity-70 text-white font-medium">
            <span className="hidden sm:inline">Home</span>
            <span className="hidden sm:inline">About</span>
            <span>Contact</span>
        </div>
      </nav>

      <Dashboard />
    </main>
  );
}
