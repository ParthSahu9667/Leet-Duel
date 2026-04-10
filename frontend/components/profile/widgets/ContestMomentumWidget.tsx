"use client";

import React, { useMemo } from "react";
import { ExpandedUserProfile } from "../../../types/type";
import { CardTiltInner } from "../CardTiltInner";
import { TrendingUp, TrendingDown, Activity, Trophy, Hash } from "lucide-react";

export const ContestMomentumWidget = ({ user }: { user: ExpandedUserProfile }) => {
  const insights = useMemo(() => {
    // 1. Fix the reversed graph: The incoming array is likely newest-first.
    // Reversing it ensures it plots chronologically from left (oldest) to right (newest).
    const rawContests = user.contests || [];
    const contests = [...rawContests].reverse();

    const count = contests.length;

    if (count === 0) return { trend: "flat", isUp: true, delta: 0, peak: user.currentRating, areaPoints: "", lineSegments: [], lastPoint: null };

    // Now that the array is oldest-first, the latest contest is correctly at the end.
    const latest = contests[count - 1];
    const previous = count > 1 ? contests[count - 2] : latest;

    const delta = latest.rating - previous.rating;
    const isUp = delta >= 0;
    const peak = Math.max(...contests.map((c) => c.rating), user.currentRating);

    const minM = Math.min(...contests.map((c) => c.rating)) - 20;
    const maxM = Math.max(...contests.map((c) => c.rating)) + 20;
    const denominator = maxM - minM || 1;

    // Calculate coordinates for all points
    const coords = contests.map((c, i) => {
      const x = (i / Math.max(1, count - 1)) * 100;
      const y = 100 - ((c.rating - minM) / denominator) * 100;
      return { x, y, rating: c.rating };
    });

    // 2. Generate individual line segments to color them dynamically (+ green, - red)
    const lineSegments = [];
    for (let i = 0; i < coords.length - 1; i++) {
      const curr = coords[i];
      const next = coords[i + 1];
      const segmentIsUp = next.rating >= curr.rating;
      lineSegments.push({
        x1: curr.x,
        y1: curr.y,
        x2: next.x,
        y2: next.y,
        isUp: segmentIsUp
      });
    }

    const points = coords.map(c => `${c.x},${c.y}`).join(' ');
    const areaPoints = `0,100 ${points} 100,100`;

    return {
      trend: isUp ? "up" : "down",
      isUp,
      delta,
      peak,
      areaPoints,
      lineSegments,
      lastPoint: coords[coords.length - 1]
    };
  }, [user.contests, user.currentRating]);

  const { isUp, delta, peak, areaPoints, lineSegments, lastPoint } = insights;

  // Variables for overall trend (used for text, background, and the graph area)
  const colorVar = isUp ? 'var(--success)' : 'var(--danger)';
  const textColor = isUp ? 'text-[var(--success)]' : 'text-[var(--danger)]';
  const bgColor = isUp ? 'bg-[var(--success)]/10' : 'bg-[var(--danger)]/10';
  const borderColor = isUp ? 'border-[var(--success)]/20' : 'border-[var(--danger)]/20';

  return (
    <CardTiltInner className="relative p-6 flex flex-col h-full min-h-[220px]">
      <div className="flex items-center justify-between mb-4 z-10">
        <div className="flex items-center gap-2">
          <Activity className="text-white/50 w-5 h-5" />
          <span className="text-white/60 text-xs font-bold uppercase tracking-wider">
            Contest Rating
          </span>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-bold border flex items-center gap-1 ${bgColor} ${textColor} ${borderColor}`}>
          {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          Top {user.ratingPercentile}%
        </span>
      </div>

      <div className="z-10 flex items-baseline gap-3 mb-4">
        <div className={`text-5xl font-bold font-mono tracking-tight ${textColor} drop-shadow-[0_0_15px_rgba(currentColor,0.3)]`}>
          {user.currentRating}
        </div>
        <div className={`text-sm font-bold ${textColor}`}>
          {delta > 0 ? '+' : ''}{delta} recent
        </div>
      </div>

      <div className="z-10 flex gap-4 text-white/50 text-xs font-medium mb-8">
        <div className="flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-yellow-500/70" />
          <span>Peak: <strong className="text-white/80">{peak}</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <Hash className="w-4 h-4 text-blue-500/70" />
          <span>Contests: <strong className="text-white/80">{user.contests.length}</strong></span>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-24 overflow-hidden rounded-b-xl opacity-80 pointer-events-none">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="spark-gradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={colorVar} stopOpacity="0.4" />
              <stop offset="100%" stopColor={colorVar} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          <polygon
            points={areaPoints}
            fill="url(#spark-gradient)"
          />

          {/* Multi-colored line segments replacing the single polyline */}
          {lineSegments.map((segment, index) => (
            <line
              key={index}
              x1={segment.x1}
              y1={segment.y1}
              x2={segment.x2}
              y2={segment.y2}
              stroke={segment.isUp ? 'var(--success)' : 'var(--danger)'}
              strokeWidth="3"
              strokeLinecap="round"
              className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
            />
          ))}

          {lastPoint && (
            <circle
              cx={lastPoint.x}
              cy={lastPoint.y}
              r="2.5"
              fill="white"
              stroke={colorVar}
              strokeWidth="1.5"
            />
          )}
        </svg>
      </div>
    </CardTiltInner>
  );
};