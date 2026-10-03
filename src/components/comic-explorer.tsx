"use client";

import { AnimatePresence, motion } from "motion/react";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { SeriesCardData } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { SeriesCard } from "@/components/series-card";

type SortKey = "rating" | "views" | "az";

export function ComicExplorer({ series }: { series: SeriesCardData[] }) {
  const [genre, setGenre] = useState<string>("Semua");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("rating");

  const genres = useMemo(() => {
    const all = new Set<string>();
    series.forEach((s) => s.genres.forEach((g) => all.add(g)));
    return ["Semua", ...Array.from(all).sort()];
  }, [series]);

  const filtered = useMemo(() => {
    let list = series;
    if (genre !== "Semua") list = list.filter((s) => s.genres.includes(genre));
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (s) => s.title.toLowerCase().includes(q) || s.author.toLowerCase().includes(q),
      );
    }
    const sorted = [...list];
    if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
    if (sort === "views") sorted.sort((a, b) => b.views - a.views);
    if (sort === "az") sorted.sort((a, b) => a.title.localeCompare(b.title));
    return sorted;
  }, [series, genre, query, sort]);

  return (
    <div>
      <div className="flex flex-col gap-4 border-3 border-paper bg-ink-soft p-4 shadow-[6px_6px_0_#c9f73a] sm:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex max-w-md flex-1 items-center gap-2 border-3 border-paper bg-ink px-3 py-2.5 focus-within:border-acid">
            <Search className="size-4 shrink-0 text-paper/50" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari judul atau kreator..."
              className="w-full bg-transparent font-mono text-sm text-paper outline-none placeholder:text-paper/35"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] tracking-[0.2em] text-paper/40 uppercase">Urutkan</span>
            {(
              [
                ["rating", "Rating"],
                ["views", "Populer"],
                ["az", "A–Z"],
              ] as [SortKey, string][]
            ).map(([k, label]) => (
              <button
                key={k}
                onClick={() => setSort(k)}
                className={cn(
                  "cursor-pointer border-2 px-2.5 py-1.5 font-mono text-[11px] font-bold tracking-widest uppercase transition-all",
                  sort === k
                    ? "border-ink bg-acid text-ink shadow-[2px_2px_0_#f5f1e8]"
                    : "border-paper/30 bg-ink text-paper/60 hover:border-paper hover:text-paper",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              className={cn(
                "shrink-0 cursor-pointer border-2 px-3 py-1.5 font-mono text-[11px] font-bold tracking-widest uppercase transition-all",
                genre === g
                  ? "-rotate-1 border-ink bg-brand text-paper shadow-[3px_3px_0_#f5f1e8]"
                  : "border-paper/25 bg-ink text-paper/55 hover:border-paper/70 hover:text-paper",
              )}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <motion.div layout className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((s, i) => (
            <motion.div
              layout
              key={s.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.4, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
            >
              <SeriesCard s={s} rank={sort === "rating" && genre === "Semua" && !query ? i + 1 : undefined} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      {filtered.length === 0 && (
        <div className="mt-10 border-3 border-dashed border-paper/30 p-14 text-center">
          <p className="font-display text-2xl text-paper/60">TIDAK DITEMUKAN</p>
          <p className="mt-2 font-mono text-xs tracking-widest text-paper/40 uppercase">
            Panel ini masih kosong — coba kata kunci lain
          </p>
        </div>
      )}
    </div>
  );
}
