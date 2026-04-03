"use client";

import React, { useState } from 'react';
import { SearchBar } from './SearchBar';
import { LeaderboardTable, RankedUser } from './LeaderboardTable';
import { motion } from 'framer-motion';

export const Dashboard = () => {
  const [users, setUsers] = useState<RankedUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (userList: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:5000/api/compare?users=${encodeURIComponent(userList)}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch comparison data');
      }
      const data: RankedUser[] = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, filter: 'blur(10px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className="max-w-[1100px] mx-auto mt-[150px] p-[20px] z-10 relative text-white"
    >
      <motion.header
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="text-center mb-[80px]"
      >
        <h1 className="text-5xl md:text-[3.5rem] font-semibold tracking-tighter mb-[15px]">
          LeetCode Comparison 
        </h1>
        <p className="text-white/50 leading-relaxed max-w-lg mx-auto mb-10 text-[1.1rem]">
          Compare LeetCode profiles based on detailed problem-solving metrics.
        </p>

        <SearchBar onSearch={handleSearch} isLoading={isLoading} />
      </motion.header>

      {error && (
        <div className="text-[#ff0070] glass-card px-6 py-3 mb-6 text-center shadow-lg border border-[#ff0070]/30 w-full max-w-2xl mx-auto">
          {error}
        </div>
      )}

      <LeaderboardTable users={users} />
    </motion.div>
  );
};
