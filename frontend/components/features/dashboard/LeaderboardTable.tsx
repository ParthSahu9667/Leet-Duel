"use client";

import React, { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Trophy, Crown, Medal, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { LeaderboardTableProps } from "@/types/type";

const AnimatedCounter = ({ to }: { to: number }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, to, { duration: 2, ease: "easeOut" });
    return controls.stop;
  }, [count, to]);

  return <motion.span>{rounded}</motion.span>;
};

const StatBar = ({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: "easy" | "medium" | "hard";
}) => {
  const percentage = total > 0 ? Math.min((value / total) * 100, 100) : 0;

  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] font-semibold text-white/60 w-[52px] uppercase tracking-wider">
        {label}
      </span>
      <div className="stat-bar-track flex-1">
        <motion.div
          className={`stat-bar-fill stat-bar-${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.4, ease: [0.23, 1, 0.32, 1], delay: 0.5 }}
        />
      </div>
      <span className="text-[12px] font-mono font-semibold text-white/80 w-[32px] text-right">
        {value}
      </span>
    </div>
  );
};

const RankBadge = ({ rank }: { rank: number }) => {
  if (rank === 1) {
    return (
      <div className="rank-badge rank-badge-gold">
        <Crown className="w-3 h-3" />
        <span>1st</span>
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="rank-badge rank-badge-silver">
        <Trophy className="w-3 h-3" />
        <span>2nd</span>
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="rank-badge rank-badge-bronze">
        <Medal className="w-3 h-3" />
        <span>3rd</span>
      </div>
    );
  }
  return (
    <div className="rank-badge rank-badge-default">
      <span>#{rank}</span>
    </div>
  );
};

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ users, onRemoveUser }) => {
  const router = useRouter();

  if (!users || users.length === 0) return null;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.12 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring" as const, bounce: 0.35, duration: 0.8 },
    },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full"
    >
      {users.map((user, index) => {
        if (user.error) {
          return (
            <motion.div
              key={user.username + index}
              variants={item}
              className="glass-card flex items-center justify-center p-6 border-[var(--danger)]/20 min-h-[120px] relative overflow-hidden"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveUser(user.username);
                }}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-all z-20"
                aria-label="Remove user"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <p className="text-[var(--danger)] font-medium text-[13px] text-center px-4">
                {user.error}
              </p>
            </motion.div>
          );
        }

        const rank = index + 1;
        const isTop = rank <= 3;

        return (
          <motion.div key={user.username} variants={item}>
            <div
              onClick={() => router.push(`/profile/${user.username}`)}
              className={`glass-card glass-card-hover flex flex-col p-7 cursor-pointer group relative ${
                rank === 1 ? "md:col-span-1 ring-1 ring-[#fbbf24]/15" : ""
              }`}
              onMouseMove={(e: React.MouseEvent<HTMLDivElement>) => {
                const card = e.currentTarget;
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / 15;
                const rotateY = (centerX - x) / 15;
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                e.currentTarget.style.transform = "";
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveUser(user.username);
                }}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 z-20"
                aria-label={`Remove ${user.username}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="mb-5">
                <RankBadge rank={rank} />
              </div>

              <div className="flex items-center gap-4 mb-5">
                <div className="avatar-ring w-20">
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-14 h-14 object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h2 className="text-[17px] font-semibold tracking-tight text-white truncate">
                    {user.username}
                  </h2>
                  <p className="text-[13px] text-white/55 font-medium flex items-center gap-2">
                    <span><AnimatedCounter to={user.solvedProblem} /> problems solved</span>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span> {user.avgQuestionsPerDay !== undefined ? user.avgQuestionsPerDay : 0} submissions/day</span>
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-[11px] uppercase tracking-[1.5px] text-white/50 font-semibold mb-1">
                  Power Score
                </p>
                <div className="text-[2.5rem] font-bold leading-none tracking-tight gradient-text font-[var(--font-mono)]">
                  <AnimatedCounter to={user.powerScore || 0} />
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <StatBar label="Easy" value={user.easySolved} total={user.solvedProblem} color="easy" />
                <StatBar label="Med" value={user.mediumSolved} total={user.solvedProblem} color="medium" />
                <StatBar label="Hard" value={user.hardSolved} total={user.solvedProblem} color="hard" />
              </div>

              {isTop && (
                <div
                  className="absolute inset-0 rounded-[24px] pointer-events-none opacity-[0.04]"
                  style={{
                    background:
                      rank === 1
                        ? "radial-gradient(circle at 50% 0%, #fbbf24, transparent 60%)"
                        : rank === 2
                        ? "radial-gradient(circle at 50% 0%, #cbd5e1, transparent 60%)"
                        : "radial-gradient(circle at 50% 0%, #fb923c, transparent 60%)",
                  }}
                />
              )}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};
