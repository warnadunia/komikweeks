"use client";

import { motion } from "motion/react";
import { Coins, Droplet, Sparkles, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { claimWelcomeCoins, topUpCoins } from "@/lib/actions";
import { WELCOME_COINS, formatIDR } from "@/lib/utils";

export function ClaimWelcomeButton({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await claimWelcomeCoins();
          if (res.ok) {
            setMsg(`+${WELCOME_COINS} Koin Tinta!`);
          } else {
            setMsg(res.error);
          }
          router.refresh();
        })
      }
      className={
        className ??
        "inline-flex cursor-pointer items-center gap-2 border-3 border-ink bg-acid px-4 py-2 font-mono text-xs font-bold tracking-widest text-ink uppercase shadow-[4px_4px_0_#000] transition-transform hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#000] disabled:opacity-60"
      }
    >
      <Sparkles className="size-4" strokeWidth={2.5} />
      {pending ? "Mengklaim..." : msg ?? label ?? `Klaim ${WELCOME_COINS} Koin Tinta Gratis`}
    </motion.button>
  );
}

export const TOPUP_PACKS = [
  { coins: 50, price: 10000 },
  { coins: 120, price: 20000 },
  { coins: 300, price: 45000 },
];

export function TopUpGrid({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [done, setDone] = useState<number | null>(null);

  return (
    <div className={compact ? "grid grid-cols-3 gap-2" : "grid gap-3 sm:grid-cols-3"}>
      {TOPUP_PACKS.map((p) => (
        <motion.button
          key={p.coins}
          whileTap={{ scale: 0.95 }}
          disabled={pending}
          onClick={() =>
            start(async () => {
              await topUpCoins(p.coins);
              setDone(p.coins);
              router.refresh();
              setTimeout(() => setDone(null), 2200);
            })
          }
          className={`group flex cursor-pointer flex-col items-center gap-0.5 border-3 border-ink px-3 py-3 text-ink transition-all hover:-translate-y-1 disabled:opacity-50 ${
            done === p.coins
              ? "bg-acid shadow-[4px_4px_0_#000]"
              : "bg-paper shadow-[4px_4px_0_rgba(0,0,0,0.9)] hover:shadow-[6px_6px_0_#000]"
          }`}
        >
          <span className="flex items-center gap-1.5 font-display text-lg leading-none sm:text-xl">
            <Coins className="size-4" strokeWidth={2.5} />
            {p.coins}
          </span>
          <span className="font-mono text-[9px] tracking-[0.15em] opacity-70">KOIN TINTA</span>
          <span className="mt-1 font-mono text-[10px] font-bold sm:text-xs">{formatIDR(p.price)}</span>
          <span className="font-mono text-[8px] tracking-widest uppercase opacity-50 group-hover:opacity-90">
            {done === p.coins ? "Berhasil!" : "Simulasi bayar"}
          </span>
        </motion.button>
      ))}
    </div>
  );
}

export function WalletBadge({ coins }: { coins: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 border-2 border-ink bg-paper px-2.5 py-1 font-mono text-xs font-bold text-ink shadow-[3px_3px_0_var(--ev-accent,#C9F73A)]">
      <Droplet className="size-3.5 fill-ink" />
      {coins}
      <span className="hidden sm:inline">KOIN</span>
    </span>
  );
}

export function WalletIcon() {
  return <Wallet className="size-4" />;
}
