"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExpandedUserProfile } from "../../types/type";
import { useUserProfile } from "../../hooks/useUserProfile";

// Import isolated widgets
import { PlayerHeaderWidget } from "./widgets/PlayerHeaderWidget";
import { ContestMomentumWidget } from "./widgets/ContestMomentumWidget";
import { AverageQuestionsWidget } from "./widgets/AverageQuestionsWidget";

export const UserProfileExpanded = ({ username }: { username: string }) => {
  const { user, loading } = useUserProfile(username);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", bounce: 0.3 } as any }
  };

  if (loading || !user) {
    // Elegant Glass Skeletons
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full animate-pulse">
        <div className="lg:col-span-3 glass-card h-[160px]" />
        <div className="glass-card h-[220px]" />
        <div className="glass-card h-[220px]" />
        <div className="lg:col-span-2 glass-card h-[220px]" />
        <div className="lg:col-span-3 glass-card h-[200px]" />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full"
    >
      <motion.div variants={itemVariants} className="lg:col-span-3">
        <PlayerHeaderWidget user={user} />
      </motion.div>

      {user.contests && user.contests.length > 0 && (
        <motion.div variants={itemVariants}>
          <ContestMomentumWidget user={user} />
        </motion.div>
      )}

      <motion.div variants={itemVariants} className={user.contests && user.contests.length > 0 ? "md:col-span-2" : "md:col-span-2"}>
        <AverageQuestionsWidget user={user} />
      </motion.div>
    </motion.div>
  );
};
