"use client";

import { motion } from "motion/react";
import { Check, Droplet, Lock, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { PageSlice } from "@/db/schema";
import { claimWelcomeCoins, unlockChapter } from "@/lib/actions";
import { WELCOME_COINS } from "@/lib/utils";
import { TopUpGrid } from "@/components/wallet-client";

export function UnlockGate({
  chapterId,
  priceCoins,
  chapterTitle,
  seriesSlug,
  balance,
  welcomeClaimed,
  preview,
}: {
  chapterId: number;
  priceCoins: number;
  chapterTitle: string;
  seriesSlug: string;
  balance: number;
  welcomeClaimed: boolean;
  preview: PageSlice | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(false);

  const handleUnlock = () =>
    start(async () => {
      setError(null);
      const res = await unlockChapter(chapterId);
      if (res.ok) {
        setUnlocked(true);
        setTimeout(() => router.refresh(), 900);
      } else {
        setError(res.error);
        router.refresh();
      }
    });

  const handleClaim = () =>
    start(async () => {
      setError(null);
      await claimWelcomeCoins();
      router.refresh();
    });

  const shortBy = Math.max(0, priceCoins - balance);

  return (
    <div className="relative">
      {preview && (
        <div className="pointer-events-none relative select-none" aria-hidden>
          <div
            className="slice aspect-[var(--ar)] opacity-30 blur-[3px] saturate-50"
            style={
              {
                "--ar": preview.ar,
                aspectRatio: preview.ar,
                backgroundImage: `url(${preview.src})`,
                backgroundPosition: `50% ${preview.pos}%`,
              } as React.CSSProperties
            }
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink/40 to-ink" />
        </div>
      )}

      <div className={`relative z-10 ${preview ? "-mt-40" : ""}`}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="border-3 border-paper bg-ink-soft p-6 shadow-[8px_8px_0_#c9f73a] sm:p-8"
        >
          <div className="flex items-start justify-between gap-4">
            <span className="inline-flex rotate-[-2deg] items-center gap-2 border-3 border-ink bg-brand px-3 py-1.5 font-mono text-[10px] font-bold tracking-[0.2em] text-paper uppercase shadow-[3px_3px_0_#000]">
              <Lock className="size-3.5" strokeWidth={3} />
              Chapter Terkunci
            </span>
            {unlocked && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, -8, 0] }}
                className="inline-flex items-center gap-1.5 border-3 border-ink bg-acid px-3 py-1.5 font-mono text-[10px] font-bold tracking-widest text-ink uppercase shadow-[3px_3px_0_#000]"
              >
                <Check className="size-3.5" strokeWidth={3.5} /> Terbuka!
              </motion.span>
            )}
          </div>

          <h3 className="mt-5 font-display text-2xl leading-tight text-paper uppercase sm:text-3xl">
            {chapterTitle}
          </h3>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-paper/60">
            Chapter ini adalah karya komikus Comic Week. Buka akses permanen dengan Koin Tinta —
            dukunganmu mengalir langsung ke sang kreator.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="border-3 border-ink bg-paper px-4 py-3 text-ink shadow-[4px_4px_0_#000]">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase opacity-60">Harga Chapter</p>
              <p className="flex items-center gap-1.5 font-display text-2xl leading-none">
                <Droplet className="size-5 fill-ink" /> {priceCoins}
              </p>
            </div>
            <div className="border-3 border-paper/40 bg-ink px-4 py-3">
              <p className="font-mono text-[9px] tracking-[0.2em] text-paper/50 uppercase">Saldomu</p>
              <p className={`flex items-center gap-1.5 font-display text-2xl leading-none ${shortBy > 0 ? "text-brand" : "text-acid"}`}>
                <Droplet className="size-5 fill-current" /> {balance}
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              disabled={pending || unlocked}
              onClick={handleUnlock}
              className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 border-3 border-ink bg-acid px-5 py-4 font-display text-base tracking-wide text-ink uppercase shadow-[5px_5px_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[7px_7px_0_#000] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none sm:px-8"
            >
              {unlocked ? "Memuat chapter..." : pending ? "Membuka..." : `Buka Chapter — ${priceCoins} Koin`}
            </motion.button>
          </div>

          {error && (
            <p className="mt-3 inline-block border-2 border-brand bg-brand/10 px-3 py-2 font-mono text-xs text-brand">
              {error}
            </p>
          )}

          <div className="mt-7 border-t-2 border-dashed border-paper/20 pt-6">
            {!welcomeClaimed && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleClaim}
                disabled={pending}
                className="mb-5 flex w-full cursor-pointer items-center justify-center gap-2 border-3 border-dashed border-acid bg-acid/10 px-4 py-3 font-mono text-xs font-bold tracking-widest text-acid uppercase transition-colors hover:bg-acid hover:text-ink disabled:opacity-50"
              >
                <Sparkles className="size-4" />
                Belum punya koin? Klaim {WELCOME_COINS} Koin Tinta sambutan — gratis!
              </motion.button>
            )}
            <p className="mb-3 font-mono text-[10px] tracking-[0.25em] text-paper/45 uppercase">
              Isi ulang Koin Tinta (simulasi pembayaran)
            </p>
            <TopUpGrid compact />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
