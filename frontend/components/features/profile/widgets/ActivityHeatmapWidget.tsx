"use client";

import React from "react";
import { ExpandedUserProfile } from "../../../../types/type";
import { CardTiltInner } from "../CardTiltInner";
import { CalendarDays } from "lucide-react";

export const ActivityHeatmapWidget = ({ user }: { user: ExpandedUserProfile }) => {
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
