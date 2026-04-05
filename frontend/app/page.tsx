"use client";

import { useEffect, useState } from "react";
import { Dashboard } from "@/components/ui/Dashboard";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
import { NavBar } from "@/components/shared/NavBar";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="min-h-screen relative">
      {/* Interactive animated background */}
      <AnimatedBackground />

      {/* Navbar Shared Component */}
      <NavBar />

      <Dashboard />
    </main>
  );
}
