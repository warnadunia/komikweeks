import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PostForm } from "@/components/admin/post-form";
import { db } from "@/db";
import { events } from "@/db/schema";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Tulis Artikel Baru — Admin" };

export default async function NewPostAdminPage() {
  const eventList = await db
    .select({
      id: events.id,
      name: events.name,
      edition: events.edition,
      slug: events.slug,
    })
    .from(events)
    .orderBy(desc(events.startDate));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/posts"
          className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-paper/50 uppercase transition-colors hover:text-acid"
        >
          <ArrowLeft className="size-3.5" /> Kembali ke Daftar Artikel
        </Link>
        <h1 className="mt-2 font-display text-3xl text-paper uppercase sm:text-4xl">
          Tulis Artikel / Update Informasi
        </h1>
        <p className="mt-1 font-mono text-xs text-paper/50">
          Buat pengumuman portal, kabar kegiatan festival, atau liputan komik baru.
        </p>
      </div>

      <PostForm events={eventList} />
    </div>
  );
}
