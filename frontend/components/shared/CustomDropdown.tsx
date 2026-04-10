"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { CustomDropdownProps } from "@/types/type";

export const CustomDropdown: React.FC<CustomDropdownProps> = ({ value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-black/40 border border-white/10 hover:bg-white/5 text-white/80 hover:text-white text-xs font-medium rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-white/20 transition-all cursor-pointer z-50"
      >
        <span>{selectedOption?.label}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-3.5 h-3.5 opacity-60" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 min-w-[130px] bg-[#0c0c0e]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.5)] z-[100] overflow-hidden"
          >
            <div className="py-1.5 flex flex-col">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`text-left px-3.5 py-2 text-[12px] tracking-wide font-semibold transition-all ${
                    option.value === value
                      ? "bg-white/10 text-white pl-4"
                      : "text-white/60 hover:bg-white/5 hover:text-white hover:pl-4"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
