"use client";

import React, { useState, useEffect } from "react";
import { SearchBar } from "./SearchBar";
import { LeaderboardTable } from "./LeaderboardTable";
import { RankedUser } from "@/types/type";
import { motion } from "framer-motion";
import { Swords, ArrowDown } from "lucide-react";

export const Dashboard = () => {
  const [usernames, setUsernames] = useState<string[]>([]);
  const [users, setUsers] = useState<RankedUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedResults = localStorage.getItem("leetduel_results");
    const savedNames = localStorage.getItem("leetduel_usernames");
    const savedHasSearched = localStorage.getItem("leetduel_has_searched");
    
    if (savedResults) {
      try {
        setUsers(JSON.parse(savedResults));
      } catch (e) {
        console.error("Failed to parse saved results");
      }
    }

    if (savedNames) {
        try {
          setUsernames(JSON.parse(savedNames));
        } catch (e) {
          console.error("Failed to parse saved names");
        }
      }
    
    if (savedHasSearched === "true") {
      setHasSearched(true);
    }
    setIsLoaded(true);
  }, []);

  // Save usernames
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("leetduel_usernames", JSON.stringify(usernames));
    }
  }, [usernames, isLoaded]);

  // Save results
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("leetduel_results", JSON.stringify(users));
      localStorage.setItem("leetduel_has_searched", hasSearched ? "true" : "false");
    }
  }, [users, hasSearched, isLoaded]);

  const handleSearch = async (userList: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(
        `${apiUrl}/api/compare?users=${encodeURIComponent(userList)}`
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch comparison data");
      }
      const data: RankedUser[] = await res.json();
      
      setUsers(data);
      setHasSearched(true);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveUser = (username: string) => {
    // Remove from both lists
    const updatedUsers = users.filter(u => u.username !== username);
    const updatedUsernames = usernames.filter(u => u !== username);
    
    setUsers(updatedUsers);
    setUsernames(updatedUsernames);
    
    if (updatedUsers.length === 0) {
      setHasSearched(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(10px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className="max-w-[1100px] mx-auto mt-[140px] px-5 pb-[120px] z-10 relative text-white"
    >
      {/* Hero Header */}
      <motion.header
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl md:text-7xl font-bold tracking-[-0.04em] mb-5 leading-[1.1]">
          <span>LeetDuel</span>
        </h1>
        <p className="text-white/65 leading-relaxed max-w-md mx-auto mb-10 text-[16px]">
          Compare LeetCode profiles head-to-head.
          <br />
          Discover who&apos;s the real grinder.
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
          transition={{ delay: 0.8 }}
          className="flex flex-col items-center justify-center mt-16 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5">
            <Swords className="w-7 h-7 text-white/40" />
          </div>
          <p className="text-white/50 text-[14px] font-medium mb-2">
            Enter LeetCode usernames above to begin
          </p>
          <ArrowDown className="w-4 h-4 text-white/35 animate-bounce mt-1" />
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
