"use client";

import React from "react";
import { ExpandedUserProfile } from "../../../../types/type";
import { CardTiltInner } from "../CardTiltInner";
import { Flame } from "lucide-react";

export const PlayerHeaderWidget = ({ user }: { user: ExpandedUserProfile }) => {
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
