"use client";

import React, { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

export interface RankedUser {
    username: string;
    avatar: string;
    powerScore?: number;
    solvedProblem: number;
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
    error: string | null;
}

interface LeaderboardTableProps {
  users: RankedUser[];
}

// Micro-component for counting up scores fluidly
const AnimatedCounter = ({ to }: { to: number }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  
  useEffect(() => {
    const controls = animate(count, to, { duration: 2, ease: "easeOut" });
    return controls.stop;
  }, [count, to]);

  return <motion.span>{rounded}</motion.span>;
};

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ users }) => {
  if (!users || users.length === 0) return null;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, bounce: 0.4, duration: 0.8 } }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[30px] w-full"
    >
      {users.map((user, index) => {
        if (user.error) {
            return (
              <motion.div
                key={user.username + index}
                variants={item}
                className="glass-card flex items-center p-4 border border-[#ff0070]/30"
              >
                <div className="text-[#ff0070] font-medium w-full text-center">
                  {user.error}
                </div>
              </motion.div>
            )
        }

        return (
          <motion.div
            key={user.username}
            variants={item}
            className="glass-card glass-card-hover flex flex-col p-[40px] relative cursor-pointer group"
            onMouseMove={(e: any) => {
              const card = e.currentTarget;
              const rect = card.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              const centerX = rect.width / 2;
              const centerY = rect.height / 2;
              const rotateX = (y - centerY) / 10;
              const rotateY = (centerX - x) / 10;
              card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
            }}
            onMouseLeave={(e: any) => {
              e.currentTarget.style.transform = '';
            }}
          >
            <div className="status-badge w-fit" style={{ color: '#00d4ff', borderColor: 'rgba(0,212,255,0.3)', background: 'rgba(0,212,255,0.1)' }}>
               Rank #{index + 1}
            </div>

            <div className="flex items-center space-x-4 mb-4 z-10">
              <img src={user.avatar} alt={user.username} className="w-16 h-16 rounded-full border border-gray-600 shadow-md object-cover" />
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-white">{user.username}</h2>
                <p className="text-sm text-white/50">Solved: <AnimatedCounter to={user.solvedProblem} /></p>
              </div>
            </div>

            <p className="text-white/50 text-sm leading-relaxed mt-4 z-10">
               Power Score: <strong className="text-white text-[2rem] leading-none mb-2 block"><AnimatedCounter to={user.powerScore || 0} /></strong>
               Easy: <span className="text-[#05f715]"><AnimatedCounter to={user.easySolved} /></span> | Medium: <span className="text-[#f7eb05]"><AnimatedCounter to={user.mediumSolved} /></span> | Hard: <span className="text-[#f70505]"><AnimatedCounter to={user.hardSolved} /></span>
            </p>
          </motion.div>
        );
      })}
    </motion.div>
  );
};
