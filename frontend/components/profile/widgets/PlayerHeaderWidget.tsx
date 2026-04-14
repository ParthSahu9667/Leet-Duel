"use client";

import React from "react";
import { WidgetProps } from "@/types/type";
import { CardTiltInner } from "../CardTiltInner";
import { Flame } from "lucide-react";

export const PlayerHeaderWidget = ({ user }: WidgetProps) => {
  return (
    <CardTiltInner className="flex flex-col md:flex-row items-center md:items-start gap-8 z-10" senstivity={750}>
      <div className="avatar-ring flex-shrink-0 relative group">
        <img src={user.avatar} alt={user.username} className="w-28 h-28 object-cover shadow-[0_0_40px_rgba(129,140,248,0.3)] transition-transform duration-500 group-hover:scale-105" />
      </div>

      <div className="flex-1 flex flex-col md:flex-row justify-between w-full">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)] mb-2">{user.username}</h1>
          <div className="flex items-center gap-3 text-[var(--text-tertiary)] text-sm font-medium">
            <Flame className="w-4 h-4 text-[var(--accent)]" /> {user.totalSolved} Problems Solved
          </div>
        </div>

        <div className="mt-6 md:mt-0 md:text-right">
          <p className="text-[12px] uppercase tracking-[2px] text-[var(--text-muted)] font-bold mb-1">Power Score</p>
          <div className="text-5xl md:text-6xl font-bold font-mono tracking-tighter gradient-text leading-none">{user.powerScore.toLocaleString()}</div>
        </div>
      </div>

      {/* Progress Bars Overlaying Bottom */}
      <div className="absolute bottom-0 left-0 w-full flex h-1.5 opacity-80 gap-1 bg-black/20">
        <div className="flex-1 relative bg-white/10 rounded-r-sm overflow-hidden">
          <div className="absolute left-0 top-0 h-full bg-[#34d399]" style={{ width: `${Math.min(100, (user.easySolved / Math.max(1, user.totalEasy)) * 100)}%` }} />
        </div>
        <div className="flex-1 relative bg-white/10 rounded-r-sm overflow-hidden">
          <div className="absolute left-0 top-0 h-full bg-[#fbbf24]" style={{ width: `${Math.min(100, (user.mediumSolved / Math.max(1, user.totalMedium)) * 100)}%` }} />
        </div>
        <div className="flex-1 relative bg-white/10 rounded-r-sm overflow-hidden">
          <div className="absolute left-0 top-0 h-full bg-[#f87171]" style={{ width: `${Math.min(100, (user.hardSolved / Math.max(1, user.totalHard)) * 100)}%` }} />
        </div>
      </div>
    </CardTiltInner>
  );
};
