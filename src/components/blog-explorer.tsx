"use client";

import { Calendar, ChevronRight, Filter, Globe, Newspaper, Search, Tag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { PostCardData } from "@/lib/queries";
import { POST_CATEGORIES } from "@/components/admin/post-form";

export function BlogExplorer({
  initialPosts,
  events,
}: {
  initialPosts: PostCardData[];
  events: { id: number; name: string; edition: string; slug: string }[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedEventId, setSelectedEventId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = initialPosts.filter((p) => {
    // Kategori
    if (selectedCategory !== "all" && p.category !== selectedCategory) {
      return false;
    }

    // Event
    if (selectedEventId === "general") {
      if (p.eventId !== null) return false;
    } else if (selectedEventId !== "all") {
      if (String(p.eventId) !== selectedEventId) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchExcerpt = p.excerpt?.toLowerCase().includes(q) ?? false;
      const matchAuthor = p.author.toLowerCase().includes(q);
      if (!matchTitle && !matchExcerpt && !matchAuthor) return false;
    }

    return true;
  });

  return (
    <div className="flex flex-col gap-8">
      {/* --------------------------- Controls & Filters --------------------------- */}
      <div className="flex flex-col gap-4 border-3 border-paper/20 bg-ink-soft p-4 sm:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-paper/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kabar, berita, pengumuman festival..."
              className="w-full border-2 border-paper/30 bg-ink py-2.5 pr-4 pl-9 font-mono text-xs text-paper placeholder:text-paper/40 focus:border-acid focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer font-mono text-[10px] text-paper/40 hover:text-paper"
              >
                Reset
              </button>
            )}
          </div>

          {/* Event Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="shrink-0 font-mono text-[10px] font-bold tracking-wider text-paper/50 uppercase">
              Filter Edisi:
            </span>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="border-2 border-paper/30 bg-ink px-3 py-2 font-mono text-xs text-paper focus:border-acid focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Edisi & General</option>
              <option value="general">🌐 Hanya Portal Umum (General)</option>
              {events.map((e) => (
                <option key={e.id} value={String(e.id)}>
                  📍 {e.name} ({e.edition})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 border-t-2 border-paper/10 pt-3">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`cursor-pointer px-3 py-1 font-mono text-[11px] font-bold tracking-wider uppercase transition-all ${
              selectedCategory === "all"
                ? "border-2 border-ink bg-acid text-ink shadow-[2px_2px_0_#fff]"
                : "border-2 border-paper/20 bg-ink text-paper/60 hover:border-paper hover:text-paper"
            }`}
          >
            Semua ({initialPosts.length})
          </button>

          {POST_CATEGORIES.map((cat) => {
            const count = initialPosts.filter((p) => p.category === cat.value).length;
            const active = selectedCategory === cat.value;

            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => setSelectedCategory(cat.value)}
                className={`cursor-pointer px-3 py-1 font-mono text-[11px] font-bold tracking-wider uppercase transition-all ${
                  active
                    ? "border-2 border-ink bg-acid text-ink shadow-[2px_2px_0_#fff]"
                    : "border-2 border-paper/20 bg-ink text-paper/60 hover:border-paper hover:text-paper"
                }`}
              >
                {cat.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* --------------------------- Posts Grid --------------------------- */}
      {filteredPosts.length === 0 ? (
        <div className="border-3 border-dashed border-paper/20 bg-ink-soft p-12 text-center">
          <Newspaper className="mx-auto size-8 text-paper/30" />
          <p className="mt-3 font-mono text-sm text-paper/50">
            Tidak ada kabar atau artikel yang sesuai dengan filter.
          </p>
          {(selectedCategory !== "all" || selectedEventId !== "all" || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("all");
                setSelectedEventId("all");
                setSearchQuery("");
              }}
              className="mt-4 inline-flex cursor-pointer items-center gap-2 border-2 border-acid bg-acid/10 px-4 py-2 font-mono text-xs font-bold text-acid uppercase hover:bg-acid hover:text-ink"
            >
              Reset Semua Filter
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => {
            const catLabel =
              POST_CATEGORIES.find((c) => c.value === post.category)?.label || post.category;

            return (
              <article
                key={post.id}
                className="group flex flex-col border-3 border-paper/30 bg-ink-soft transition-all hover:-translate-y-1 hover:border-paper hover:shadow-[6px_6px_0_#c9f73a]"
              >
                {/* Cover Image */}
                <Link href={`/blog/${post.slug}`} className="relative aspect-[16/10] overflow-hidden border-b-3 border-paper/30 bg-ink">
                  {post.coverImage ? (
                    <div
                      className="size-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                      style={{ backgroundImage: `url(${post.coverImage})` }}
                    />
                  ) : (
                    <div className="halftone-dark flex size-full items-center justify-center p-4 text-center font-display text-2xl text-paper/20 uppercase">
                      COMIC WEEK
                    </div>
                  )}

                  {/* Category Pill on Image */}
                  <span className="absolute top-3 left-3 border-2 border-ink bg-paper px-2.5 py-1 font-mono text-[9px] font-bold tracking-widest text-ink uppercase shadow-[2px_2px_0_#000]">
                    {catLabel}
                  </span>
                </Link>

                <div className="flex flex-1 flex-col p-5">
                  {/* Event or General Badge */}
                  <div className="mb-2 flex items-center gap-2">
                    {post.eventName ? (
                      <Link
                        href={`/events/${post.eventSlug}`}
                        className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-acid hover:underline uppercase"
                      >
                        <Calendar className="size-3" />
                        {post.eventName}
                      </Link>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] text-paper/50 uppercase">
                        <Globe className="size-3" />
                        General Portal
                      </span>
                    )}

                    <span className="text-paper/20">•</span>
                    <time className="font-mono text-[10px] text-paper/40">
                      {new Date(post.publishedAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </time>
                  </div>

                  {/* Title */}
                  <h3 className="font-display text-xl leading-snug text-paper uppercase group-hover:text-acid group-hover:underline">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>

                  {/* Excerpt */}
                  {post.excerpt && (
                    <p className="mt-2.5 line-clamp-3 text-xs leading-relaxed text-paper/65">
                      {post.excerpt}
                    </p>
                  )}

                  {/* Read More Link */}
                  <div className="mt-auto pt-4">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1 font-mono text-xs font-bold tracking-wider text-acid uppercase transition-all group-hover:translate-x-1"
                    >
                      Baca Selengkapnya <ChevronRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
