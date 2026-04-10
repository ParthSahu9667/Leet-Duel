"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, Loader2, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { SearchBarProps } from "@/types/type";

export const SearchBar: React.FC<SearchBarProps> = ({ usernames, setUsernames, onSearch, isLoading }) => {
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addUsername = () => {
    const trimmed = input.trim().toLowerCase();
    if (trimmed && !usernames.includes(trimmed)) {
      setUsernames((prev) => [...prev, trimmed]);
      setInput("");
      inputRef.current?.focus();
    }
  };

  const removeUsername = (name: string) => {
    setUsernames((prev) => prev.filter((u) => u !== name));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (input.trim()) {
        addUsername();
      } else if (usernames.length >= 1) {
        onSearch(usernames.join(","));
      }
    }
  };

  const handleCompare = () => {
    let finalList = [...usernames];
    const trimmed = input.trim().toLowerCase();
    if (trimmed && !finalList.includes(trimmed)) {
      finalList.push(trimmed);
      setUsernames(finalList);
      setInput("");
    }
    if (finalList.length >= 1) {
      onSearch(finalList.join(","));
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto z-20 gap-3">
      <AnimatePresence>
        {usernames.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap justify-center gap-2 w-full"
          >
            {usernames.map((name) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ type: "spring", bounce: 0.4, duration: 0.4 }}
                className="user-chip"
              >
                <span className="text-[13px] font-semibold tracking-tight">
                  {name}
                </span>
                <button
                  type="button"
                  onClick={() => removeUsername(name)}
                  className="chip-remove"
                  aria-label={`Remove ${name}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={`relative w-full flex items-center glass-card px-5 py-3 rounded-[20px] transition-all duration-500 ${
          isFocused
            ? "border-[var(--accent)] bg-[rgba(255,255,255,0.05)] shadow-[0_0_0_3px_rgba(129,140,248,0.12),0_0_40px_-5px_var(--accent-glow)]"
            : "shadow-[0_4px_30px_rgba(0,0,0,0.2)]"
        }`}
        onClick={() => inputRef.current?.focus()}
      >
        <Search
          className={`w-5 h-5 mr-3 transition-colors duration-300 flex-shrink-0 ${
            isFocused ? "text-[var(--accent)]" : "text-white/45"
          }`}
        />

        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={
            usernames.length === 0
              ? "Type a username and press Enter to add..."
              : "Add another username..."
          }
          className="bg-transparent text-white outline-none w-full placeholder-white/40 font-medium text-[15px] tracking-tight"
          disabled={isLoading}
        />

        <button
          type="button"
          onClick={addUsername}
          className="glass-button ml-2 flex items-center gap-1.5 whitespace-nowrap text-[12px] px-4 py-2 flex-shrink-0"
          disabled={isLoading || !input.trim()}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>

        <button
          type="button"
          onClick={handleCompare}
          className="glass-button ml-2 flex items-center gap-2 whitespace-nowrap text-[13px] px-6 py-2.5 flex-shrink-0"
          disabled={isLoading || (usernames.length === 0 && !input.trim())}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Scanning</span>
            </>
          ) : (
            "Compare"
          )}
        </button>
      </div>

      {usernames.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[12px] text-white/45 font-medium"
        >
          {usernames.length} user{usernames.length !== 1 ? "s" : ""} added
          {usernames.length < 2 && " — add at least one more to compare"}
        </motion.p>
      )}
    </div>
  );
};
