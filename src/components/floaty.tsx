"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

export function Floaty({
  children,
  className,
  delay = 0,
  amount = 12,
  duration = 5,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  amount?: number;
  duration?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 46, rotate: 0 }}
      animate={{ opacity: 1, y: [0, -amount, 0] }}
      transition={{
        opacity: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] },
        y: { duration, delay: delay + 0.4, repeat: Infinity, ease: "easeInOut" },
      }}
    >
      {children}
    </motion.div>
  );
}
