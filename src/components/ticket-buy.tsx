"use client";

import { motion } from "motion/react";
import { Check, Ticket } from "lucide-react";
import { useState } from "react";

export function TicketBuyButton({ tierName }: { tierName: string }) {
  const [state, setState] = useState<"idle" | "processing" | "done">("idle");

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      disabled={state !== "idle"}
      onClick={() => {
        setState("processing");
        setTimeout(() => setState("done"), 1200);
        setTimeout(() => setState("idle"), 4200);
      }}
      className="mt-auto inline-flex w-full cursor-pointer items-center justify-center gap-2 border-3 border-ink bg-ink px-4 py-3.5 font-display text-sm tracking-wide text-paper uppercase shadow-[4px_4px_0_rgba(10,10,14,0.55)] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0_rgba(10,10,14,0.7)] disabled:cursor-wait"
    >
      {state === "idle" && (
        <>
          <Ticket className="size-4" />
          Amankan Kursi
        </>
      )}
      {state === "processing" && "Memproses pembayaran..."}
      {state === "done" && (
        <>
          <Check className="size-4" strokeWidth={3.5} />
          {tierName} diamankan! (Simulasi)
        </>
      )}
    </motion.button>
  );
}
