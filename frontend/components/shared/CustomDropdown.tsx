"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { CustomDropdownProps } from "@/types/type";

export const CustomDropdown: React.FC<CustomDropdownProps> = ({ value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  // 1. Avoid hydration errors in Next.js by ensuring we only portal after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // 2. Calculate coordinates for the portaled menu
  useEffect(() => {
    const updatePosition = () => {
      if (isOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setDropdownPos({
          top: rect.bottom + window.scrollY,
          // Calculate right-alignment to match your previous `right-0` behavior
          right: document.documentElement.clientWidth - rect.right - window.scrollX,
        });
      }
    };

    updatePosition();

    // Recalculate if the window is resized or scrolled
    if (isOpen) {
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
    }

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);

  // 3. Handle clicking outside (requires checking BOTH the button and the portaled menu)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        buttonRef.current && !buttonRef.current.contains(target) &&
        menuRef.current && !menuRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-[var(--btn-bg)] border border-[var(--glass-border)] hover:bg-[var(--btn-bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-medium rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-[var(--glass-border-hover)] transition-all cursor-pointer z-50 relative"
      >
        <span>{selectedOption?.label}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-3.5 h-3.5 opacity-60" />
        </motion.div>
      </button>

      {/* 4. The Portal that escapes the CardTilt wrapper */}
      {mounted && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              style={{
                position: "absolute",
                top: `${dropdownPos.top + 8}px`, // 8px gap below the button
                right: `${dropdownPos.right}px`,
              }}
              className="min-w-[130px] bg-[var(--glass-strong)] backdrop-blur-xl border border-[var(--glass-border)] rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.2)] z-[9999] overflow-hidden"
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
                        ? "bg-[var(--accent)]/10 text-[var(--text-primary)] pl-4"
                        : "text-[var(--text-tertiary)] hover:bg-[var(--glass)] hover:text-[var(--text-primary)] hover:pl-4"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};