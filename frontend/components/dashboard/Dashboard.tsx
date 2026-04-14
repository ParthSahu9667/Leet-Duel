"use client";

import React, { useState, useEffect } from "react";
import { SearchBar } from "./SearchBar";
import { LeaderboardTable } from "./LeaderboardTable";
import { RankedUser } from "@/types/type";
import { useDashboardState } from "../../hooks/useDashboardState";
import { motion } from "framer-motion";
import { Swords, ArrowDown } from "lucide-react";

export const Dashboard = () => {
  const {
    usernames,
    setUsernames,
    users,
    isLoading,
    error,
    hasSearched,
    handleSearch,
    handleRemoveUser,
  } = useDashboardState();

  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(10px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="max-w-[1100px] mx-auto mt-[140px] px-5 pb-[120px] z-10 relative"
    >
      {/* Hero Header */}
      <motion.header
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="text-center mb-16"
      >
        <h1 className="text-[3.5rem] md:text-[5rem] font-extrabold tracking-tight mb-5 leading-tight text-[var(--text-primary)]">
          LeetDuel
        </h1>
        <p className="text-[var(--text-secondary)] font-medium leading-relaxed max-w-lg mx-auto mb-12 text-[17px]">
          Compare LeetCode profiles head-to-head.<br />
          Discover who's the real grinder.
        </p>

        <SearchBar 
          usernames={usernames} 
          setUsernames={setUsernames} 
          onSearch={handleSearch} 
          isLoading={isLoading} 
        />
      </motion.header>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card px-6 py-4 mb-8 text-center max-w-2xl mx-auto border-[var(--danger)]/30"
        >
          <p className="text-[var(--danger)] font-medium text-[14px]">{error}</p>
        </motion.div>
      )}

      {/* Empty / Landing State */}
      {!hasSearched && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col items-center justify-center mt-16 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-[var(--glass)] border border-[var(--glass-border)] flex items-center justify-center mb-5">
            <Swords className="w-7 h-7 text-[var(--text-muted)]" />
          </div>
          <p className="text-[var(--text-tertiary)] text-[14px] font-medium mb-2">
            Enter LeetCode usernames above to begin
          </p>
          <ArrowDown className="w-4 h-4 text-[var(--text-muted)] animate-bounce mt-1" />
        </motion.div>
      )}

      {/* Results */}
      <LeaderboardTable 
        users={users} 
        onRemoveUser={handleRemoveUser} 
      />
    </motion.div>
  );
};
