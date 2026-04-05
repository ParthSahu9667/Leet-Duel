"use client";

import React from "react";
import { ExpandedUserProfile } from "../../../../types/type";
import { CardTiltInner } from "../CardTiltInner";
import { Code2 } from "lucide-react";

export const LanguageMasteryWidget = ({ user }: { user: ExpandedUserProfile }) => {
  const totalLangs = user.languages.reduce((acc, curr) => acc + curr.problemsSolved, 0);

  return (
    <CardTiltInner>
      <div className="flex items-center gap-2 mb-6">
        <Code2 className="text-white/40 w-5 h-5" />
        <span className="text-white/40 text-xs font-bold uppercase tracking-wider">Top Languages</span>
      </div>

      <div className="flex flex-col gap-4">
        {user.languages.map((lang, idx) => {
          const percent = totalLangs ? (lang.problemsSolved / totalLangs) * 100 : 0;
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
