"use client";

import { motion, useScroll, useSpring } from "motion/react";

export function ReadProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.4 });
  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-[70] h-1.5 origin-left bg-acid"
      style={{ scaleX }}
    />
  );
}
