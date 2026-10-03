import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SeriesForm } from "@/components/admin/series-form";
import { db } from "@/db";
import { events } from "@/db/schema";
import { listPublicMedia } from "@/lib/media";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Judul Baru" };

export default async function NewSeriesPage() {
  const [eventRows, media] = await Promise.all([
    db.select({ id: events.id, name: events.name }).from(events),
    listPublicMedia(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <Link href="/admin/series" className="inline-flex items-center gap-2 font-mono text-[11px] font-bold tracking-widest text-paper/50 uppercase hover:text-acid">
          <ArrowLeft className="size-4" /> Semua Seri
        </Link>
        <h1 className="mt-3 font-display text-3xl text-paper uppercase sm:text-4xl">Judul Komik Baru</h1>
        <p className="mt-2 max-w-xl text-sm text-paper/55">
          Seri baru langsung bisa diikat ke edisi event sebagai “debut”. Chapter ditambahkan setelah
          judul tersimpan.
        </p>
      </header>
      <SeriesForm defaults={{}} events={eventRows} media={media} />
    </div>
  );
}
