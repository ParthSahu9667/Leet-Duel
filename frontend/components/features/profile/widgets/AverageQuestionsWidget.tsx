"use client";

import React, { useState, useMemo } from "react";
import { WidgetProps } from "@/types/type";
import { CardTiltInner } from "../CardTiltInner";
import { CustomDropdown } from "@/components/shared/CustomDropdown";
import { Calculator } from "lucide-react";

export const AverageQuestionsWidget = ({ user }: WidgetProps) => {
  const [days, setDays] = useState<number>(30); // Default to 30 days
  const options = [7, 14, 30, 90, 365];

  const average = useMemo(() => {
    if (!user.calendar) return 0;
    
    const calendarDates = Object.keys(user.calendar);
    if (calendarDates.length === 0) return 0;
    
    // Create Date from current time to compute trailing period accurately
    const targetTime = Date.now() - (days * 24 * 60 * 60 * 1000);
    
    let sum = 0;
    calendarDates.forEach(dateStr => {
      // leetcodeQueryController sets keys as 'YYYY-MM-DD'
      const ts = new Date(dateStr).getTime();
      if (ts >= targetTime) {
        sum += user.calendar[dateStr];
      }
    });
    
    return sum / days;
  }, [user.calendar, days]);

  return (
    <CardTiltInner className="relative h-full flex flex-col justify-between min-h-[220px]" senstivity={300}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
            <Calculator className="text-[#fbbf24] w-5 h-5 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
          </div>
          <p className="text-white/50 text-xs font-bold uppercase tracking-wider">Submissions / Day</p>
        </div>
        
        <CustomDropdown
          value={days}
          onChange={(val) => setDays(Number(val))}
          options={options.map(opt => ({ label: `Last ${opt} Days`, value: opt }))}
        />
      </div>
      
      <div className="mt-auto">
        <div className="text-[3.5rem] font-bold font-[var(--font-mono)] leading-none tracking-tight text-white gap-2 flex items-baseline">
          {average.toFixed(2)}
          <span className="text-lg text-white/30 font-medium tracking-normal">avg</span>
        </div>
        <p className="text-white/40 text-[13px] font-medium mt-2">
          Based on submission calendar activity.
        </p>
      </div>
      
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#fbbf24]/5 blur-[70px] rounded-full pointer-events-none -mr-10 -mt-10" />
    </CardTiltInner>
  );
};
