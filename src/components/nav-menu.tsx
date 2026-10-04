"use client";

import { AnimatePresence, motion } from "motion/react";
import { Coins, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ClaimWelcomeButton } from "@/components/wallet-client";
import { ThemeToggle } from "@/components/theme-toggle";

export function NavMenuButton({
  links,
}: {
  links: { href: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Menu"
        className="flex size-10 cursor-pointer items-center justify-center border-3 border-paper bg-ink text-paper shadow-[3px_3px_0_#c9f73a]"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-x-4 top-20 z-50 flex flex-col gap-2 border-3 border-paper bg-ink p-4 shadow-[6px_6px_0_#c9f73a]"
          >
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between border-2 border-paper/20 bg-ink-soft px-4 py-3 font-mono text-sm font-bold tracking-widest text-paper uppercase hover:border-acid hover:text-acid"
              >
                {l.label}
                <span>→</span>
              </Link>
            ))}
            <div className="mt-1 flex flex-col gap-2 border-t-2 border-dashed border-paper/20 pt-3">
              <ThemeToggle showLabel className="w-full justify-center py-2" />
              <div className="flex items-center gap-2">
                <Coins className="size-4 text-acid shrink-0" />
                <ClaimWelcomeButton label="Klaim 100 Koin Tinta" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
