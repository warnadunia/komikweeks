import type { Metadata } from "next";
import { sql } from "drizzle-orm";
import { ArrowUpRight, Globe, Plus } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/admin/fields";
import { db } from "@/db";
import { events } from "@/db/schema";
import { dateRange, formatIDR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Edisi Event" };

export default async function EventsAdminPage() {
  const rows = await db
    .select({
      id: events.id,
      slug: events.slug,
      name: events.name,
      edition: events.edition,
      theme: events.theme,
      status: events.status,
      isPublished: events.isPublished,
      accent: events.accent,
      startDate: events.startDate,
      endDate: events.endDate,
      venue: events.venue,
      tickets: events.tickets,
      scheduleCount: sql<number>`(select count(*)::int from schedules s where s.event_id = ${events.id})`,
      guestCount: sql<number>`(select count(*)::int from guests g where g.event_id = ${events.id})`,
      seriesCount: sql<number>`(select count(*)::int from series sr where sr.event_id = ${events.id})`,
    })
    .from(events)
    .orderBy(events.startDate);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] font-bold tracking-[0.3em] text-acid uppercase">Microsite</p>
          <h1 className="mt-2 font-display text-3xl text-paper uppercase sm:text-4xl">Edisi Event</h1>
          <p className="mt-2 max-w-xl text-sm text-paper/55">
            Setiap baris di sini adalah satu microsite utuh. Info publik hanya tampil jika status{" "}
            <span className="text-acid">Terbit</span> menyala.
          </p>
        </div>
        <Link
          href="/admin/events/new"
          className="inline-flex items-center gap-2 border-3 border-ink bg-acid px-5 py-3 font-display text-sm tracking-wide text-ink uppercase shadow-[5px_5px_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[7px_7px_0_#000]"
        >
          <Plus className="size-4" strokeWidth={3} /> Edisi Baru
        </Link>
      </header>

      <div className="flex flex-col gap-4">
        {rows.map((e) => (
          <Link
            key={e.id}
            href={`/admin/events/${e.id}`}
            className="group grid gap-4 border-3 border-paper/20 bg-ink-soft p-5 transition-all hover:-translate-y-1 hover:border-paper sm:grid-cols-[auto_1fr_auto] sm:items-center"
            style={{ boxShadow: `5px 5px 0 ${e.accent}` }}
          >
            <div
              className="flex size-16 items-center justify-center border-3 border-ink font-display text-xs text-ink shadow-[2px_2px_0_#000]"
              style={{ backgroundColor: e.accent }}
            >
              {e.edition}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-xl text-paper uppercase group-hover:underline">{e.name}</h2>
                <StatusBadge status={e.status} />
                {e.isPublished ? (
                  <span className="inline-flex items-center gap-1 border-2 border-acid/70 bg-acid/10 px-2 py-0.5 font-mono text-[9px] font-bold tracking-widest text-acid uppercase">
                    <Globe className="size-3" /> Terbit
                  </span>
                ) : (
                  <span className="border-2 border-paper/30 px-2 py-0.5 font-mono text-[9px] font-bold tracking-widest text-paper/40 uppercase">
                    Draft
                  </span>
                )}
              </div>
              <p className="mt-1 truncate font-mono text-[10px] tracking-widest text-paper/45 uppercase">
                {e.theme} · {dateRange(e.startDate, e.endDate)} · {e.venue}
              </p>
              <p className="mt-1.5 font-mono text-[10px] text-paper/35">
                {e.scheduleCount} agenda · {e.guestCount} guest · {e.seriesCount} komik debut
                {e.tickets?.length ? ` · tiket mulai ${formatIDR(Math.min(...e.tickets.map((t) => t.price)))}` : " · belum ada tiket"}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 justify-self-start font-mono text-[10px] font-bold tracking-widest text-paper/50 uppercase transition-colors group-hover:text-acid sm:justify-self-end">
              Kelola <ArrowUpRight className="size-4" />
            </span>
          </Link>
        ))}
      </div>
      <p className="font-mono text-[10px] tracking-wider text-paper/30 uppercase">
        Tip: microsite edisi baru otomatis muncul di arsip hub begitu toggle Terbit dinyalakan.
      </p>
    </div>
  );
}
