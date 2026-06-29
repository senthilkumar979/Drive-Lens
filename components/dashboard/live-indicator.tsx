"use client";

import { motion } from "framer-motion";

interface LiveIndicatorProps {
  isLive?: boolean;
}

export const LiveIndicator = ({ isLive = true }: LiveIndicatorProps) => {
  if (!isLive) return null;

  return (
    <span
      className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400"
    >
      <motion.span
        className="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
        animate={{ opacity: [1, 0.4, 1], scale: [1, 1.15, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      Live
    </span>
  );
};
