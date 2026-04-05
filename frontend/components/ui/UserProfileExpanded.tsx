"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExpandedUserProfile, SubmissionCalendar } from "../../types/type";
import { TrendingUp, TrendingDown, Minus, Flame, Code2, Activity, CalendarDays, Award } from "lucide-react";
import Link from "next/link";

// Aggregator connecting to our Backend Proxy
async function fetchLeetCodeProfile(username: string): Promise<ExpandedUserProfile> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const BASE = `${API_URL}/api/leetcode/${username}`;

  // Fire all proxies concurrently
  const reqs = [
    fetch(`${BASE}`).catch(() => null),
    fetch(`${BASE}/solved`).catch(() => null),
    fetch(`${BASE}/badges`).catch(() => null),
    fetch(`${BASE}/language`).catch(() => null),
    fetch(`${BASE}/contest`).catch(() => null),
    fetch(`${BASE}/calendar`).catch(() => null)
  ];

  const results = await Promise.all(reqs);

  const [profileRes, solvedRes, badgesRes, langRes, contestRes, calendarRes] = await Promise.all(
    results.map(r => r && r.ok ? r.json() : null)
  );

  // Defensive extraction
  const profile = profileRes || {};
  const solved = solvedRes || {};
  const badgeData = badgesRes?.badges || []; 
  const languages = langRes?.language || [];
  const contestInfo = contestRes?.contestParticipation || []; 
  const calendarData = calendarRes?.submissionCalendar || "{}";
  
  const totalSolved = solved.solvedProblem || 0;
  const rating = contestRes?.contestRating || 0;
  const powerScore = Math.floor(rating * 1.5 + totalSolved * 5); 

  let calendarMap: SubmissionCalendar = {};
  try {
     const parsedCal = typeof calendarData === 'string' ? JSON.parse(calendarData) : calendarData;
     Object.keys(parsedCal).forEach(ts => {
        const dateStr = new Date(parseInt(ts) * 1000).toISOString().split('T')[0];
        calendarMap[dateStr] = (calendarMap[dateStr] || 0) + parsedCal[ts];
     });
  } catch (e) {
     console.warn("Calendar parse failed", e);
  }

  const rawContests = Array.isArray(contestInfo) ? contestInfo : [];

  return {
    username: profile.username || username,
    avatar: profile.avatar || 'https://assets.leetcode.com/users/default_avatar.jpg',
    powerScore: powerScore,
    totalSolved: totalSolved,
    easySolved: solved.easySolved || 0,
    mediumSolved: solved.mediumSolved || 0,
    hardSolved: solved.hardSolved || 0,
    totalEasy: 0,
    totalMedium: 0,
    totalHard: 0,
    languages: (Array.isArray(languages) ? languages : []).map(l => ({
        languageName: l.languageName,
        problemsSolved: l.problemsSolved
    })).sort((a,b) => b.problemsSolved - a.problemsSolved).slice(0, 4),
    contests: rawContests.map((c: any) => ({
        contestName: c.contest?.title || 'Contest',
        rating: Math.floor(c.rating || 0),
        ranking: c.ranking || 0,
        trend: (c.trendDirection === 'UP' ? 'up' : c.trendDirection === 'DOWN' ? 'down' : 'flat'),
        date: ''
    })),
    currentRating: Math.floor(contestRes?.contestRating || 0),
    ratingPercentile: parseFloat(contestRes?.contestTopPercentage || "100"),
    calendar: calendarMap,
    badges: badgeData.map((b: any, index: number) => ({
        id: b.id || String(index),
        name: b.name || b.displayName,
        iconUrl: b.icon || '',
        category: "Participant",
        creationDate: ''
    }))
  };
}

// Helper for 3D tilt effects
const CardTiltInner = ({ children, className = "", senstivity = 25 }: { children: React.ReactNode, className?: string, senstivity?: number }) => {
  return (
    <div
      className={`glass-card glass-card-hover p-6 h-full cursor-pointer relative ${className}`}
      onMouseMove={(e: React.MouseEvent<HTMLDivElement>) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / senstivity;
        const rotateY = (centerX - x) / senstivity;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        card.style.zIndex = "10";
      }}
      onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
        const card = e.currentTarget;
        card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
        card.style.zIndex = "1";
      }}
      style={{ transition: "transform 0.1s ease-out, z-index 0s" }}
    >
      {/* Glossy overlay sheen */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-inherit" />
      {children}
    </div>
  );
};

// --- Widget 1: Player Header ---
const PlayerHeaderWidget = ({ user }: { user: ExpandedUserProfile }) => {
  return (
    <CardTiltInner className="flex flex-col md:flex-row items-center md:items-start gap-8 z-10" senstivity={350}>
      <div className="avatar-ring flex-shrink-0 relative group">
        <img src={user.avatar} alt={user.username} className="w-28 h-28 object-cover shadow-[0_0_40px_rgba(129,140,248,0.3)] transition-transform duration-500 group-hover:scale-105" />
      </div>

      <div className="flex-1 flex flex-col md:flex-row justify-between w-full">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">{user.username}</h1>
          <div className="flex items-center gap-3 text-white/50 text-sm font-medium">
            <Flame className="w-4 h-4 text-[var(--accent)]" /> {user.totalSolved} Problems Solved
          </div>
        </div>

        <div className="mt-6 md:mt-0 md:text-right">
          <p className="text-[12px] uppercase tracking-[2px] text-white/40 font-bold mb-1">Power Score</p>
          <div className="text-5xl md:text-6xl font-bold font-mono tracking-tighter gradient-text leading-none">{user.powerScore.toLocaleString()}</div>
        </div>
      </div>

      {/* Progress Bars Overlaying Bottom */}
      <div className="absolute bottom-0 left-0 w-full flex h-1.5 opacity-80">
        <div className="bg-[#34d399] h-full" style={{ width: `${(user.easySolved / user.totalSolved) * 100}%` }} />
        <div className="bg-[#fbbf24] h-full" style={{ width: `${(user.mediumSolved / user.totalSolved) * 100}%` }} />
        <div className="bg-[#f87171] h-full" style={{ width: `${(user.hardSolved / user.totalSolved) * 100}%` }} />
      </div>
    </CardTiltInner>
  );
};

// --- Widget 2: Contest Momentum ---
const ContestMomentumWidget = ({ user }: { user: ExpandedUserProfile }) => {
  const latest = user.contests[user.contests.length - 1];
  const isUp = latest.trend === 'up';

  // Minimalist SVG Sparkline calculation
  const points = user.contests.map((c, i) => {
    const x = (i / (user.contests.length - 1)) * 100;
    // Normalize rating to fit sparkline box (mock implementation)
    const minM = Math.min(...user.contests.map((c) => c.rating)) - 20;
    const maxM = Math.max(...user.contests.map((c) => c.rating)) + 20;
    const y = 100 - ((c.rating - minM) / (maxM - minM)) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <CardTiltInner className="relative overflow-visible">
      <div className="flex items-center justify-between mb-2">
        <Activity className="text-white/40 w-5 h-5" />
        <span className={`text-xs px-2 py-1 rounded-full font-bold ${isUp ? 'bg-[var(--success)]/20 text-[var(--success)] border border-[var(--success)]/30' : 'bg-[var(--danger)]/20 text-[var(--danger)] border border-[var(--danger)]/30'}`}>
          {isUp ? <TrendingUp className="w-3 h-3 inline mr-1" /> : <TrendingDown className="w-3 h-3 inline mr-1" />} Top {user.ratingPercentile}%
        </span>
      </div>
      <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-1">Contest Rating</p>
      <div className={`text-4xl font-bold font-mono tracking-tight ${isUp ? 'text-[var(--success)]' : 'text-[var(--danger)]'} drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]`}>
        {user.currentRating}
      </div>

      <div className="absolute inset-x-0 bottom-4 px-6 h-12">
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible preserve-aspect-ratio-none">
          <polyline points={points} fill="none" stroke={isUp ? 'var(--success)' : 'var(--danger)'} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
            className="drop-shadow-[0_4px_8px_rgba(52,211,153,0.5)]" />
        </svg>
      </div>
    </CardTiltInner>
  );
};

// --- Widget 3: Language Mastery ---
const LanguageMasteryWidget = ({ user }: { user: ExpandedUserProfile }) => {
  const totalLangs = user.languages.reduce((acc, curr) => acc + curr.problemsSolved, 0);

  return (
    <CardTiltInner>
      <div className="flex items-center gap-2 mb-6">
        <Code2 className="text-white/40 w-5 h-5" />
        <span className="text-white/40 text-xs font-bold uppercase tracking-wider">Top Languages</span>
      </div>

      <div className="flex flex-col gap-4">
        {user.languages.map((lang, idx) => {
          const percent = (lang.problemsSolved / totalLangs) * 100;
          // Colors: Blue, Purple, Teal, Orange
          const colors = ['bg-blue-400', 'bg-purple-400', 'bg-teal-400', 'bg-orange-400'];
          const glow = ['shadow-[0_0_15px_rgba(96,165,250,0.5)]', 'shadow-[0_0_15px_rgba(192,132,252,0.5)]', 'shadow-[0_0_15px_rgba(45,212,191,0.5)]', 'shadow-[0_0_15px_rgba(251,146,60,0.5)]'];
          return (
            <div key={lang.languageName} className="space-y-1.5">
              <div className="flex justify-between text-[13px] font-semibold text-white/80">
                <span>{lang.languageName}</span>
                <span className="font-mono text-white/50">{lang.problemsSolved}</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div className={`h-full ${colors[idx % colors.length]} ${glow[idx % glow.length]} rounded-full`} style={{ width: `${percent}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </CardTiltInner>
  );
};

// --- Widget 4: Activity Heatmap (Using Glass Beads) ---
const ActivityHeatmapWidget = ({ user }: { user: ExpandedUserProfile }) => {
  // Simplified rendering of the 365 days into columns (weeks)
  const days = Object.keys(user.calendar).sort();
  // Cut down to last 160 days for UI fit just as an example
  const displayDays = days.slice(-160);

  return (
    <CardTiltInner className="md:col-span-2 relative overflow-hidden group" senstivity={350}>
      <div className="flex items-center gap-2 mb-5">
        <CalendarDays className="text-white/40 w-5 h-5" />
        <span className="text-white/40 text-xs font-bold uppercase tracking-wider">Activity Matrix</span>
      </div>

      <div className="w-full overflow-hidden">
        <div className="grid grid-rows-7 grid-flow-col gap-[3px] opacity-80 group-hover:opacity-100 transition-opacity">
          {displayDays.map((dateStr) => {
            const count = user.calendar[dateStr];
            const isActive = count > 0;
            // Generate intensity dynamically (1 to 4)
            const intensity = count > 6 ? 4 : count > 3 ? 3 : count > 1 ? 2 : count > 0 ? 1 : 0;

            let colorClass = "empty";
            if (intensity === 1) colorClass = "active opacity-40";
            if (intensity === 2) colorClass = "active opacity-60";
            if (intensity === 3) colorClass = "active opacity-80";
            if (intensity === 4) colorClass = "active opacity-100 drop-shadow-[0_0_5px_var(--accent)]";

            return (
              <div
                key={dateStr}
                className={`glass-bead w-full aspect-square ${colorClass}`}
                title={`${dateStr}: ${count} submissions`}
              />
            );
          })}
        </div>
      </div>
    </CardTiltInner>
  );
};

// --- Widget 5: Trophy Cabinet ---
const TrophyCabinetWidget = ({ user }: { user: ExpandedUserProfile }) => {
  return (
    <div className="lg:col-span-3 glass-card glass-card-hover p-6 md:p-8 flex flex-col relative overflow-hidden">
      <div className="flex items-center gap-2 mb-8">
        <Award className="text-white/40 w-5 h-5" />
        <span className="text-white/40 text-xs font-bold uppercase tracking-wider">Trophy Cabinet</span>
      </div>

      {/* The Physical Glass Shelf */}
      <div className="relative mt-auto w-full pt-4 px-4 pb-2 glass-shelf flex items-end justify-center md:justify-start gap-6 md:gap-10 overflow-x-auto min-h-[120px]">
        {user.badges.map((badge, idx) => (
          <motion.div
            key={badge.id}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: + (idx * 0.01), type: "spring", stiffness: 200, damping: 15 }}
            className="group relative cursor-pointer flex flex-col items-center justify-end z-10"
            whileHover={{
              y: -25,
              scale: 1.15,
              rotateY: 10,
              rotateX: 5,
              transition: { type: "spring", stiffness: 350, damping: 8 }
            }}
          >
            {/* The actual badge token (Water Bubble effect) */}
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full p-4 bg-gradient-to-tr from-white/10 via-transparent to-white/40 border border-white/50 shadow-[inset_0_8px_16px_rgba(255,255,255,0.6),inset_0_-8px_16px_rgba(255,255,255,0.2),0_10px_20px_rgba(0,0,0,0.5)] backdrop-blur-xl flex items-center justify-center transition-all duration-300 group-hover:border-white/80 group-hover:shadow-[inset_0_12px_24px_rgba(255,255,255,0.8),inset_0_-8px_20px_rgba(255,255,255,0.4),0_20px_40px_rgba(255,255,255,0.3)]">
              <img src={badge.iconUrl} alt={badge.name} className="w-full h-full object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)] group-hover:drop-shadow-[0_8px_16px_rgba(255,255,255,0.5)] transition-all duration-300 transform group-hover:scale-105" />
            </div>
            {/* Badge Reflection on shelf */}
            <div className="absolute -bottom-8 w-16 h-8 bg-gradient-to-t from-white/20 to-transparent blur-md rounded-full transform scale-y-50 opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Tooltip */}
            <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 backdrop-blur-xl text-white text-[11px] font-bold px-3 py-1.5 rounded-lg border border-white/20 whitespace-nowrap pointer-events-none shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
              {badge.name}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};


// --- Main Layout Assembly Component ---
export const UserProfileExpanded = ({ username }: { username: string }) => {
  const [user, setUser] = useState<ExpandedUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Simulate network fetching
  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchLeetCodeProfile(username).then((data) => {
        if (active) {
            setUser(data);
            setLoading(false);
        }
    }).catch(err => {
        console.error("Failed to load profile", err);
        setLoading(false);
    });
    return () => { active = false; };
  }, [username]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", bounce: 0.3 } as any }
  };

  if (loading || !user) {
    // Elegant Glass Skeletons
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full animate-pulse">
        <div className="lg:col-span-3 glass-card h-[160px] bg-white/5" />
        <div className="glass-card h-[220px] bg-white/5" />
        <div className="glass-card h-[220px] bg-white/5" />
        <div className="lg:col-span-2 glass-card h-[220px] bg-white/5" />
        <div className="lg:col-span-3 glass-card h-[200px] bg-white/5" />
      </div>
    );
  }


  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full"
    >
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
        <div className="flex gap-[24px] text-[13px] text-white/60 font-medium">
          <Link href="/" className="hidden sm:inline hover:text-white/80 transition-colors cursor-pointer">
            Home
          </Link>
          <span className="hidden sm:inline hover:text-white/80 transition-colors cursor-pointer">
            About
          </span>
          <span className="hover:text-white/80 transition-colors cursor-pointer">
            Contact
          </span>
        </div>
      </motion.nav>

      <motion.div variants={itemVariants} className="lg:col-span-3">
        <PlayerHeaderWidget user={user} />
      </motion.div>

      {user.contests && user.contests.length > 0 && (
        <motion.div variants={itemVariants}>
          <ContestMomentumWidget user={user} />
        </motion.div>
      )}

      <motion.div variants={itemVariants}>
        <LanguageMasteryWidget user={user} />
      </motion.div>

      <motion.div variants={itemVariants} className={user.contests && user.contests.length > 0 ? "md:col-span-2" : "md:col-span-2"}>
        <ActivityHeatmapWidget user={user} />
      </motion.div>

      <motion.div variants={itemVariants} className="lg:col-span-3">
        <TrophyCabinetWidget user={user} />
      </motion.div>
    </motion.div>
  );
};
