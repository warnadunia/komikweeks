"use client";

import { useEffect, useState } from "react";

function diff(target: number) {
  const now = Date.now();
  const ms = Math.max(0, target - now);
  return {
    hari: Math.floor(ms / 86_400_000),
    jam: Math.floor((ms / 3_600_000) % 24),
    menit: Math.floor((ms / 60_000) % 60),
    detik: Math.floor((ms / 1_000) % 60),
    over: ms === 0,
  };
}

export function Countdown({ target, small = false }: { target: string; small?: boolean }) {
  const [t, setT] = useState<ReturnType<typeof diff> | null>(null);
  const targetMs = new Date(target).getTime();

  useEffect(() => {
    const frameId = requestAnimationFrame(() => setT(diff(targetMs)));
    const id = setInterval(() => setT(diff(targetMs)), 1000);
    return () => {
      cancelAnimationFrame(frameId);
      clearInterval(id);
    };
  }, [targetMs]);

  const parts = t
    ? [
        { v: t.hari, l: "HARI" },
        { v: t.jam, l: "JAM" },
        { v: t.menit, l: "MENIT" },
        { v: t.detik, l: "DETIK" },
      ]
    : [
        { v: "–", l: "HARI" },
        { v: "–", l: "JAM" },
        { v: "–", l: "MENIT" },
        { v: "–", l: "DETIK" },
      ];

  return (
    <div className="flex items-stretch gap-2 sm:gap-3">
      {parts.map((p) => (
        <div
          key={p.l}
          className={`flex min-w-16 flex-col items-center justify-center border-3 border-ink bg-paper text-ink shadow-[4px_4px_0_var(--ev-accent,#C9F73A)] ${
            small ? "px-2 py-1.5 sm:min-w-16" : "px-3 py-2.5 sm:min-w-20"
          }`}
        >
          <span className={`font-display leading-none tabular-nums ${small ? "text-xl sm:text-2xl" : "text-2xl sm:text-4xl"}`}>
            {p.v}
          </span>
          <span className="mt-1 font-mono text-[9px] tracking-[0.18em] sm:text-[10px]">{p.l}</span>
        </div>
      ))}
    </div>
  );
}
