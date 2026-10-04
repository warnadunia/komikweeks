"use client";

import { AnimatePresence, motion } from "motion/react";
import { CalendarRange, Filter, Layers, Search, ShoppingBag, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import type { ProductCardData } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/product-card";

type SortKey = "featured" | "price_asc" | "price_desc" | "newest";

export function ProductExplorer({ products }: { products: ProductCardData[] }) {
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [category, setCategory] = useState<string>("Semua");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("featured");

  // Ekstraksi opsi Event dari data produk
  const eventOptions = useMemo(() => {
    const map = new Map<string, { label: string; count: number }>();
    products.forEach((p) => {
      if (p.eventName) {
        const key = p.eventName;
        const count = (map.get(key)?.count ?? 0) + 1;
        const label = p.eventEdition ? `${p.eventName} (${p.eventEdition})` : p.eventName;
        map.set(key, { label, count });
      }
    });

    const list = Array.from(map.entries()).map(([k, v]) => ({
      key: k,
      label: v.label,
      count: v.count,
    }));

    return [{ key: "all", label: "Semua Edisi Festival", count: products.length }, ...list];
  }, [products]);

  // Ekstraksi kategori dari data produk
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.category));
    return ["Semua", ...Array.from(set).sort()];
  }, [products]);

  const filtered = useMemo(() => {
    let list = products;

    // Filter event
    if (selectedEvent !== "all") {
      list = list.filter((p) => p.eventName === selectedEvent);
    }

    // Filter kategori
    if (category !== "Semua") {
      list = list.filter((p) => p.category === category);
    }

    // Filter search text
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.badge && p.badge.toLowerCase().includes(q)) ||
          (p.eventName && p.eventName.toLowerCase().includes(q)),
      );
    }

    // Sorting
    const sorted = [...list];
    if (sort === "featured") {
      sorted.sort((a, b) => Number(b.featured) - Number(a.featured));
    } else if (sort === "price_asc") {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sort === "price_desc") {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sort === "newest") {
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return sorted;
  }, [products, selectedEvent, category, query, sort]);

  return (
    <div>
      {/* Control Panel Filter & Pencarian */}
      <div className="flex flex-col gap-4 border-3 border-paper bg-ink-soft p-4 shadow-[6px_6px_0_#c9f73a] sm:p-5">
        {/* Row 1: Search & Sort */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex max-w-md flex-1 items-center gap-2 border-3 border-paper bg-ink px-3 py-2.5 focus-within:border-acid">
            <Search className="size-4 shrink-0 text-paper/50" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari artbook, apparel, kaos, print, stiker..."
              className="w-full bg-transparent font-mono text-sm text-paper outline-none placeholder:text-paper/35"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] tracking-[0.2em] text-paper/40 uppercase">Urutkan</span>
            {(
              [
                ["featured", "Unggulan"],
                ["price_asc", "Harga: Rendah"],
                ["price_desc", "Harga: Tinggi"],
                ["newest", "Terbaru"],
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

        {/* Row 2: Filter Event Volume / Edisi */}
        <div className="flex flex-col gap-2 border-t-2 border-paper/15 pt-3">
          <div className="flex items-center gap-2">
            <CalendarRange className="size-3.5 text-acid" />
            <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-paper/70 uppercase">
              Merchandise Edisi Event / Tahun:
            </span>
          </div>
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {eventOptions.map((opt) => {
              const active = selectedEvent === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => setSelectedEvent(opt.key)}
                  className={cn(
                    "flex shrink-0 cursor-pointer items-center gap-1.5 border-2 px-3 py-1.5 font-mono text-[11px] font-bold tracking-wider uppercase transition-all",
                    active
                      ? "border-ink bg-acid text-ink shadow-[3px_3px_0_#000]"
                      : "border-paper/25 bg-ink text-paper/60 hover:border-paper/60 hover:text-paper",
                  )}
                >
                  <span>{opt.label}</span>
                  <span
                    className={cn(
                      "px-1 py-0.2 text-[9px] font-mono",
                      active ? "bg-ink text-acid" : "bg-paper/15 text-paper/70",
                    )}
                  >
                    {opt.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 3: Filter Kategori */}
        <div className="flex flex-col gap-2 border-t-2 border-dashed border-paper/15 pt-3">
          <div className="flex items-center gap-2">
            <Layers className="size-3.5 text-brand" />
            <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-paper/70 uppercase">
              Kategori Produk:
            </span>
          </div>
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={cn(
                  "shrink-0 cursor-pointer border-2 px-3 py-1.5 font-mono text-[11px] font-bold tracking-widest uppercase transition-all",
                  category === c
                    ? "-rotate-1 border-ink bg-brand text-paper shadow-[3px_3px_0_#f5f1e8]"
                    : "border-paper/25 bg-ink text-paper/55 hover:border-paper/70 hover:text-paper",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Katalog Produk */}
      <motion.div layout className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((p, i) => (
            <motion.div
              layout
              key={p.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.35, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
            >
              <ProductCard p={p} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="mt-10 border-3 border-dashed border-paper/30 p-14 text-center">
          <ShoppingBag className="mx-auto size-10 text-paper/30" />
          <p className="mt-3 font-display text-2xl text-paper/60 uppercase">Produk Tidak Ditemukan</p>
          <p className="mt-2 font-mono text-xs tracking-widest text-paper/40 uppercase">
            Belum ada katalog untuk kombinasi filter ini — coba reset kata kunci atau kategori.
          </p>
          <button
            onClick={() => {
              setQuery("");
              setCategory("Semua");
              setSelectedEvent("all");
            }}
            className="mt-5 inline-flex cursor-pointer items-center gap-2 border-2 border-acid bg-ink px-4 py-2 font-mono text-xs font-bold tracking-widest text-acid uppercase hover:bg-acid hover:text-ink transition-colors"
          >
            Reset Semua Filter
          </button>
        </div>
      )}
    </div>
  );
}
