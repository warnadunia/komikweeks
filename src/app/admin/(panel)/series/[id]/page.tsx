import type { Metadata } from "next";
import { asc, eq } from "drizzle-orm";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/admin/action-form";
import { ChapterManager } from "@/components/admin/chapter-manager";
import { SectionCard } from "@/components/admin/fields";
import { SeriesForm } from "@/components/admin/series-form";
import { db } from "@/db";
import { chapters, events, series } from "@/db/schema";
import { deleteSeries } from "@/lib/admin-actions";
import { listPublicMedia } from "@/lib/media";
import { toWIBDateInput } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Kelola Seri" };

export default async function EditSeriesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const seriesId = Number(id);
  const [s, eventRows, chapterRows, media] = await Promise.all([
    db.select().from(series).where(eq(series.id, seriesId)).limit(1).then((r) => r[0]),
    db.select({ id: events.id, name: events.name }).from(events),
    db.select().from(chapters).where(eq(chapters.seriesId, seriesId)).orderBy(asc(chapters.number)),
    listPublicMedia(),
  ]);
  if (!s) notFound();

  async function removeSeries() {
    "use server";
    return deleteSeries(seriesId);
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/series" className="inline-flex items-center gap-2 font-mono text-[11px] font-bold tracking-widest text-paper/50 uppercase hover:text-acid">
            <ArrowLeft className="size-4" /> Semua Seri
          </Link>
          <h1 className="mt-3 font-display text-3xl text-paper uppercase sm:text-4xl">
            Kelola <span className="text-[#8B5CF6]">{s.title}</span>
          </h1>
        </div>
        <Link
          href={`/comics/${s.slug}`}
          className="inline-flex items-center gap-2 border-2 border-acid px-4 py-2.5 font-mono text-[10px] font-bold tracking-widest text-acid uppercase transition-colors hover:bg-acid hover:text-ink"
        >
          <ExternalLink className="size-4" /> Lihat Halaman Publik
        </Link>
      </header>

      <SeriesForm
        defaults={{
          id: s.id,
          slug: s.slug,
          title: s.title,
          author: s.author,
          genres: s.genres,
          synopsis: s.synopsis,
          status: s.status,
          rating: s.rating,
          views: s.views,
          likes: s.likes,
          coverImage: s.coverImage,
          featured: s.featured,
          releaseDay: s.releaseDay,
          eventId: s.eventId,
        }}
        events={eventRows}
        media={media}
      />

      <ChapterManager
        seriesId={s.id}
        media={media}
        chapters={chapterRows.map((c) => ({
          id: c.id,
          number: c.number,
          title: c.title,
          publishedAtLocal: toWIBDateInput(c.publishedAt),
          isFree: c.isFree,
          priceCoins: c.priceCoins,
          isPublished: c.isPublished,
          pages: c.pages,
        }))}
      />

      <SectionCard title="Zona Berbahaya" accent="#FF4D00" desc="tindakan tidak bisa dibatalkan">
        <div className="flex flex-wrap items-center justify-between gap-4 border-2 border-dashed border-brand/50 bg-brand/5 p-4">
          <p className="max-w-md text-sm text-paper/60">
            Menghapus seri akan menghapus seluruh chapter, halaman, dan riwayat unlock pembacanya.
          </p>
          <DeleteButton
            action={removeSeries}
            label="Hapus Seri Ini"
            confirmText={`Hapus "${s.title}" beserta ${chapterRows.length} chapter-nya?`}
          />
        </div>
      </SectionCard>
    </div>
  );
}
