import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { Newspaper, Sparkles } from "lucide-react";
import { BlogExplorer } from "@/components/blog-explorer";
import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { db } from "@/db";
import { events } from "@/db/schema";
import { getPublishedPosts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kabar & Blog — Update Kegiatan & Berita Komik",
  description:
    "Pusat informasi resmi Comic Week Indonesia: pengumuman festival, liputan kegiatan panggung, dokumentasi artist alley, dan berita perilisan komik.",
};

export default async function BlogPage() {
  const [posts, eventList] = await Promise.all([
    getPublishedPosts(),
    db
      .select({
        id: events.id,
        name: events.name,
        edition: events.edition,
        slug: events.slug,
      })
      .from(events)
      .orderBy(desc(events.startDate)),
  ]);

  return (
    <div className="relative min-h-screen">
      <SiteNav />

      {/* ------------------------------- HERO ------------------------------- */}
      <section className="halftone-dark relative overflow-hidden border-b-3 border-paper">
        <div className="pointer-events-none absolute -top-10 -right-20 select-none font-display text-[22rem] leading-none text-hollow opacity-[0.05]">
          NEWS
        </div>

        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <Reveal>
            <p className="inline-flex items-center gap-2 border-2 border-acid bg-ink px-3 py-1.5 font-mono text-[10px] font-bold tracking-[0.3em] text-acid uppercase sm:text-xs">
              <Sparkles className="size-3.5" /> Portal Kabar & Redaksi
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 className="mt-4 font-display text-5xl tracking-tight text-paper uppercase sm:text-7xl lg:text-8xl">
              Kabar <span className="text-hollow-accent">Festival</span>
            </h1>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-paper/70 sm:text-lg">
              Arsip pengumuman resmi, dokumentasi kegiatan panggung, jadwal workshop, dan
              liputan eksklusif dari gelaran Comic Week di seluruh Indonesia.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------- LIST SECTION ------------------------------- */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <BlogExplorer initialPosts={posts} events={eventList} />
      </section>

      <SiteFooter />
    </div>
  );
}
