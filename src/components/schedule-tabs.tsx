"use client";

import { AnimatePresence, motion } from "motion/react";
import { Clock, MapPin } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export type ScheduleItem = {
  id: number;
  day: number;
  dateLabel: string;
  time: string;
  title: string;
  stage: string;
  kind: string;
};

const KIND_STYLE: Record<string, { label: string; cls: string }> = {
  ceremony: { label: "Seremoni", cls: "bg-brand text-paper" },
  talk: { label: "Talkshow", cls: "bg-acid text-ink" },
  workshop: { label: "Workshop", cls: "bg-vio text-paper" },
  signing: { label: "Meet & Greet", cls: "bg-sky text-ink" },
  show: { label: "Panggung", cls: "bg-paper text-ink" },
  screening: { label: "Screening", cls: "bg-ink text-acid" },
  competition: { label: "Kompetisi", cls: "bg-[#FF3D81] text-paper" },
};

export function ScheduleTabs({ items, accent }: { items: ScheduleItem[]; accent: string }) {
  const days = useMemo(() => Array.from(new Set(items.map((i) => i.day))).sort(), [items]);
  const [day, setDay] = useState(days[0] ?? 1);
  const list = items.filter((i) => i.day === day);
  const dateLabel = list[0]?.dateLabel ?? "";

  return (
    <div>
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
        {days.map((d) => (
          <button
            key={d}
            onClick={() => setDay(d)}
            className={cn(
              "shrink-0 cursor-pointer border-3 px-4 py-2.5 font-display text-sm tracking-wide uppercase transition-all sm:px-6 sm:text-base",
              day === d
                ? "border-ink text-ink shadow-[4px_4px_0_#0a0a0e]"
                : "border-ink/0 bg-ink/20 text-paper/60 hover:text-paper",
            )}
            style={day === d ? { backgroundColor: accent } : undefined}
          >
            Hari {d}
          </button>
        ))}
      </div>
      <p className="mt-3 font-mono text-xs tracking-[0.25em] text-paper/50 uppercase">{dateLabel}</p>
      <AnimatePresence mode="wait">
        <motion.div
          key={day}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.28 }}
          className="mt-5 flex flex-col gap-3"
        >
          {list.map((it) => {
            const badge = KIND_STYLE[it.kind] ?? KIND_STYLE.talk;
            return (
              <div
                key={it.id}
                className="group flex flex-col gap-3 border-3 border-paper/15 bg-ink-soft p-4 transition-all hover:border-paper hover:shadow-[6px_6px_0_rgba(245,241,232,0.25)] sm:flex-row sm:items-center sm:gap-5"
              >
                <div className="flex w-24 shrink-0 items-center gap-1.5 font-mono text-sm font-bold text-paper sm:flex-col sm:items-start sm:gap-0">
                  <Clock className="size-3.5 opacity-50 sm:hidden" />
                  {it.time}
                  <span className="font-mono text-[9px] tracking-widest text-paper/40 uppercase sm:mt-1">WIB</span>
                </div>
                <div className="flex-1">
                  <p className="font-display text-base leading-snug text-paper uppercase sm:text-lg">
                    {it.title}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-paper/50 uppercase">
                    <MapPin className="size-3" />
                    {it.stage}
                  </p>
                </div>
                <span className={cn("w-fit shrink-0 border-2 border-ink px-2 py-1 font-mono text-[9px] font-bold tracking-widest uppercase shadow-[2px_2px_0_#000]", badge.cls)}>
                  {badge.label}
                </span>
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
