"use client";

import { motion } from "framer-motion";

interface LiveIndicatorProps {
  isLive?: boolean;
}

export const LiveIndicator = ({ isLive = true }: LiveIndicatorProps) => {
  if (!isLive) return null;

  return (
    <span className="flex items-center gap-1.5 text-xs text-accent">
      <motion.span
        className="size-2 rounded-full bg-accent"
        animate={{ opacity: [1, 0.4, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      Live
    </span>
  );
};
