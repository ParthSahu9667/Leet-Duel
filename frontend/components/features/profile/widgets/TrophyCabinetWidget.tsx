"use client";

import React from "react";
import { ExpandedUserProfile } from "../../../../types/type";
import { motion } from "framer-motion";
import { Award } from "lucide-react";

export const TrophyCabinetWidget = ({ user }: { user: ExpandedUserProfile }) => {
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
            transition={{ delay: +(idx * 0.01), type: "spring", stiffness: 200, damping: 15 }}
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
