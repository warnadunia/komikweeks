import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { EventForm } from "@/components/admin/event-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Edisi Baru" };

export default async function NewEventPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <Link href="/admin/events" className="inline-flex items-center gap-2 font-mono text-[11px] font-bold tracking-widest text-paper/50 uppercase hover:text-acid">
          <ArrowLeft className="size-4" /> Semua Edisi
        </Link>
        <h1 className="mt-3 font-display text-3xl text-paper uppercase sm:text-4xl">Edisi Baru</h1>
        <p className="mt-2 max-w-xl text-sm text-paper/55">
          Membuat edisi baru berarti menelurkan microsite baru di{" "}
          <span className="font-mono text-acid">/events/&lt;slug&gt;</span>. Setelah tersimpan kamu
          bisa mengisi jadwal dan guest star di halaman kelola.
        </p>
      </header>
      <EventForm defaults={{ isPublished: false }} />
    </div>
  );
}
