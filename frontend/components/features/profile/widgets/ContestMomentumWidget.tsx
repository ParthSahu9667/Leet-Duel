"use client";

import React from "react";
import { ExpandedUserProfile } from "../../../../types/type";
import { CardTiltInner } from "../CardTiltInner";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

export const ContestMomentumWidget = ({ user }: { user: ExpandedUserProfile }) => {
  const latest = user.contests[user.contests.length - 1] || { trend: "flat" };
  const isUp = latest.trend === 'up';

  // Minimalist SVG Sparkline calculation
  const points = user.contests.map((c, i) => {
    const x = (i / (Math.max(1, user.contests.length - 1))) * 100;
    // Normalize rating to fit sparkline box (mock implementation)
    const minM = Math.min(...user.contests.map((c) => c.rating)) - 20;
    const maxM = Math.max(...user.contests.map((c) => c.rating)) + 20;
    const denominator = maxM - minM || 1;
    const y = 100 - ((c.rating - minM) / denominator) * 100;
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
