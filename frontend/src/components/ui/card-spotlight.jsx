import React from "react";

export const CardSpotlight = ({ children, className }) => {
  return (
    <div className={`relative rounded-xl overflow-hidden ${className}`}>
      {/* Glowing Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-10 blur-lg" />
      {/* Content */}
      <div className="relative z-10 h-full w-full bg-white dark:bg-neutral-900 p-6 rounded-xl">
        {children}
      </div>
    </div>
  );
};