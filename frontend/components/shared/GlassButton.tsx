import React from "react";
import Link from "next/link";

export interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
}

export const GlassButton: React.FC<GlassButtonProps> = ({ 
  href, 
  children, 
  className = "", 
  ...props 
}) => {
  const baseClass = `glass-button ${className}`.trim();

  if (href) {
    return (
      <Link href={href} className={baseClass}>
        {children}
      </Link>
    );
  }

  return (
    <button className={baseClass} {...props}>
      {children}
    </button>
  );
};
