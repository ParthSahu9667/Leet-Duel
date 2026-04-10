"use client";

import React from "react";
import { CardTiltInnerProps } from "@/types/type";

export const CardTiltInner = ({ children, className = "", senstivity = 25 }: CardTiltInnerProps) => {
  return (
    <div
      className={`glass-card glass-card-hover p-6 h-full cursor-pointer relative ${className}`}
      onMouseMove={(e: React.MouseEvent<HTMLDivElement>) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / senstivity;
        const rotateY = (centerX - x) / senstivity;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        card.style.zIndex = "10";
      }}
      onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
        const card = e.currentTarget;
        card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
        card.style.zIndex = "1";
      }}
      style={{ transition: "transform 0.1s ease-out, z-index 0s" }}
    >
      {/* Glossy overlay sheen */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-inherit" />
      {children}
    </div>
  );
};
