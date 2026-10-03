import type { Metadata } from "next";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { DeleteButton } from "@/components/admin/action-form";
import { EventForm } from "@/components/admin/event-form";
import { SectionCard } from "@/components/admin/fields";
import { GuestManager, ScheduleManager } from "@/components/admin/event-content-managers";
import { db } from "@/db";
import { events, guests, schedules } from "@/db/schema";
import { deleteEvent } from "@/lib/admin-actions";
import { toWIBDateTimeLocal } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Kelola Edisi" };

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const eventId = Number(id);
  const [event, scheduleRows, guestRows] = await Promise.all([
    db.select().from(events).where(eq(events.id, eventId)).limit(1).then((r) => r[0]),
    db.select().from(schedules).where(eq(schedules.eventId, eventId)).orderBy(asc(schedules.day), asc(schedules.time)),
    db.select().from(guests).where(eq(guests.eventId, eventId)),
  ]);
  if (!event) notFound();

  async function removeEvent() {
    "use server";
    return deleteEvent(eventId);
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/events" className="inline-flex items-center gap-2 font-mono text-[11px] font-bold tracking-widest text-paper/50 uppercase hover:text-acid">
            <ArrowLeft className="size-4" /> Semua Edisi
          </Link>
          <h1 className="mt-3 font-display text-3xl text-paper uppercase sm:text-4xl">
            Kelola <span style={{ color: event.accent }}>{event.name}</span>
          </h1>
        </div>
        {event.isPublished && (
          <Link
            href={`/events/${event.slug}`}
            className="inline-flex items-center gap-2 border-2 border-acid px-4 py-2.5 font-mono text-[10px] font-bold tracking-widest text-acid uppercase transition-colors hover:bg-acid hover:text-ink"
          >
            <ExternalLink className="size-4" /> Lihat Microsite
          </Link>
        )}
      </header>

      <EventForm
        defaults={{
          id: event.id,
          slug: event.slug,
          name: event.name,
          edition: event.edition,
          theme: event.theme,
          tagline: event.tagline ?? "",
          description: event.description ?? "",
          city: event.city ?? "",
          venue: event.venue ?? "",
          startLocal: toWIBDateTimeLocal(event.startDate),
          endLocal: toWIBDateTimeLocal(event.endDate),
          status: event.status,
          isPublished: event.isPublished,
          accent: event.accent,
          accent2: event.accent2,
          stats: event.stats,
          tickets: event.tickets,
        }}
      />

      <ScheduleManager eventId={event.id} items={scheduleRows} />
      <GuestManager eventId={event.id} items={guestRows} />

      <SectionCard title="Zona Berbahaya" desc="tindakan tidak bisa dibatalkan" accent="#FF4D00">
        <div className="flex flex-wrap items-center justify-between gap-4 border-2 border-dashed border-brand/50 bg-brand/5 p-4">
          <p className="max-w-md text-sm text-paper/60">
            Menghapus edisi akan menghapus microsite beserta seluruh jadwal dan guest star-nya.
            Seri komik yang debut di sini tidak ikut terhapus (tautan debutnya dilepas).
          </p>
          <DeleteButton
            action={removeEvent}
            label="Hapus Edisi Ini"
            confirmText={`Hapus ${event.name} beserta seluruh jadwal & guest star-nya?`}
          />
        </div>
      </SectionCard>
    </div>
  );
}
