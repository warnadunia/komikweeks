import type { Metadata } from "next";
import { eq, sql } from "drizzle-orm";
import { ArrowUpRight, Plus, Star } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/admin/fields";
import { db } from "@/db";
import { events, series } from "@/db/schema";
import { getSeriesCover } from "@/lib/dummy-images";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Seri Komik" };

export default async function SeriesAdminPage() {
  const rows = await db
    .select({
      id: series.id,
      slug: series.slug,
      title: series.title,
      author: series.author,
      genres: series.genres,
      status: series.status,
      rating: series.rating,
      views: series.views,
      coverImage: series.coverImage,
      featured: series.featured,
      eventName: events.name,
      publishedChapters: sql<number>`(select count(*)::int from chapters c where c.series_id = ${series.id} and c.is_published = true)`,
      totalChapters: sql<number>`(select count(*)::int from chapters c where c.series_id = ${series.id})`,
    })
    .from(series)
    .leftJoin(events, eq(series.eventId, events.id))
    .orderBy(series.id);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] font-bold tracking-[0.3em] text-acid uppercase">Biblioteka</p>
          <h1 className="mt-2 font-display text-3xl text-paper uppercase sm:text-4xl">Seri & Chapter</h1>
          <p className="mt-2 max-w-xl text-sm text-paper/55">
            Katalog komik orisinal Comic Week. Chapter pertama idealnya gratis; kelanjutannya
            dijajakan dengan Koin Tinta.
          </p>
        </div>
        <Link
          href="/admin/series/new"
          className="inline-flex items-center gap-2 border-3 border-ink bg-acid px-5 py-3 font-display text-sm tracking-wide text-ink uppercase shadow-[5px_5px_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[7px_7px_0_#000]"
        >
          <Plus className="size-4" strokeWidth={3} /> Judul Baru
        </Link>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {rows.map((s) => (
          <Link
            key={s.id}
            href={`/admin/series/${s.id}`}
            className="group flex gap-4 border-3 border-paper/20 bg-ink-soft p-4 transition-all hover:-translate-y-1 hover:border-paper hover:shadow-[6px_6px_0_#8b5cf6]"
          >
            <div
              className="aspect-[768/1376] w-16 shrink-0 border-2 border-paper bg-cover bg-center"
              style={{ backgroundImage: `url(${getSeriesCover(s.coverImage, s.slug)})` }}
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate font-display text-lg text-paper uppercase group-hover:underline">
                  {s.title}
                </h2>
                <StatusBadge status={s.status} />
                {s.featured && (
                  <span className="border-2 border-acid/70 bg-acid/10 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-widest text-acid uppercase">
                    ★ Sorotan
                  </span>
                )}
              </div>
              <p className="mt-0.5 truncate font-mono text-[10px] tracking-widest text-paper/45 uppercase">
                {s.author} · {s.genres.join(", ")}
              </p>
              <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 font-mono text-[10px] text-paper/40">
                <span className="inline-flex items-center gap-1"><Star className="size-3 fill-acid text-acid" /> {s.rating.toFixed(1)}</span>
                <span>{s.publishedChapters}/{s.totalChapters} chapter terbit</span>
                <span>debut: {s.eventName ?? "—"}</span>
              </p>
            </div>
            <ArrowUpRight className="size-4 shrink-0 self-start text-paper/40 transition-colors group-hover:text-acid" />
          </Link>
        ))}
      </div>
    </div>
  );
}
