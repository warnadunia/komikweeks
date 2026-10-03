"use client";

import { ChevronDown, Clock, Mic2, Plus } from "lucide-react";
import { ActionForm, DeleteButton } from "@/components/admin/action-form";
import { Field, inputCls, SectionCard } from "@/components/admin/fields";
import {
  deleteGuest,
  deleteSchedule,
  upsertGuest,
  upsertSchedule,
} from "@/lib/admin-actions";

/* ------------------------------- schedules ------------------------------- */

export type ScheduleRow = {
  id: number;
  eventId: number;
  day: number;
  dateLabel: string;
  time: string;
  title: string;
  stage: string;
  kind: string;
};

const KINDS = ["ceremony", "talk", "workshop", "signing", "show", "screening", "competition"];
const STAGES = ["Main Stage", "Creator Stage", "Workshop Hall", "Artist Alley"];

function ScheduleFields({ item }: { item?: ScheduleRow }) {
  return (
    <div className="grid gap-3 sm:grid-cols-6">
      <Field label="Hari ke-" className="sm:col-span-1">
        <input type="number" min={1} max={7} name="day" required defaultValue={item?.day ?? 1} className={inputCls} />
      </Field>
      <Field label="Label Tanggal" className="sm:col-span-2">
        <input name="dateLabel" required defaultValue={item?.dateLabel ?? ""} placeholder="Sabtu, 14 Nov 2026" className={inputCls} />
      </Field>
      <Field label="Jam" className="sm:col-span-1">
        <input name="time" required defaultValue={item?.time ?? "10:00"} placeholder="10:00" className={inputCls} />
      </Field>
      <Field label="Jenis" className="sm:col-span-1">
        <select name="kind" defaultValue={item?.kind ?? "talk"} className={inputCls}>
          {KINDS.map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
      </Field>
      <Field label="Panggung" className="sm:col-span-1">
        <input list="stage-presets" name="stage" required defaultValue={item?.stage ?? "Main Stage"} className={inputCls} />
        <datalist id="stage-presets">
          {STAGES.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </Field>
      <Field label="Judul Agenda" className="sm:col-span-6">
        <input name="title" required defaultValue={item?.title ?? ""} placeholder="Live Drawing: Bimo Aditya" className={inputCls} />
      </Field>
    </div>
  );
}

export function ScheduleManager({ eventId, items }: { eventId: number; items: ScheduleRow[] }) {
  const sorted = [...items].sort((a, b) => a.day - b.day || a.time.localeCompare(b.time));

  return (
    <SectionCard
      title="Rundown / Jadwal"
      desc={`${items.length} agenda di ${new Set(items.map((i) => i.day)).size} hari`}
      accent="#35E0FF"
    >
      <div className="mb-5 border-2 border-dashed border-paper/25 bg-ink p-4">
        <p className="mb-3 flex items-center gap-2 font-mono text-[10px] font-bold tracking-widest text-acid uppercase">
          <Plus className="size-3.5" /> Tambah Agenda Baru
        </p>
        <ActionForm action={upsertSchedule} submit="Tambah Agenda" resetOnSuccess tone="paper">
          <input type="hidden" name="eventId" value={eventId} />
          <ScheduleFields />
        </ActionForm>
      </div>

      {sorted.length === 0 ? (
        <p className="font-mono text-xs text-paper/40">Belum ada agenda — tambahkan yang pertama di atas.</p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {sorted.map((it) => (
            <li key={it.id} className="border-2 border-paper/15 bg-ink">
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
                  <span className="flex w-14 shrink-0 items-center justify-center gap-1 border-2 border-paper/30 px-1.5 py-1 font-mono text-[10px] font-bold text-paper/80">
                    <Clock className="size-3" /> {it.time}
                  </span>
                  <span className="shrink-0 border-2 border-ink bg-sky px-1.5 py-0.5 font-mono text-[9px] font-bold text-ink uppercase">
                    Hari {it.day}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-paper/90">{it.title}</p>
                    <p className="truncate font-mono text-[9px] tracking-wider text-paper/40 uppercase">
                      {it.dateLabel} · {it.stage} · {it.kind}
                    </p>
                  </div>
                  <ChevronDown className="size-4 shrink-0 text-paper/40 transition-transform group-open:rotate-180" />
                </summary>
                <div className="border-t-2 border-paper/10 px-4 py-4">
                  <ActionForm action={upsertSchedule} submit="Perbarui Agenda" hideSubmit={false}>
                    <input type="hidden" name="id" value={it.id} />
                    <input type="hidden" name="eventId" value={eventId} />
                    <ScheduleFields item={it} />
                  </ActionForm>
                  <div className="mt-3 border-t-2 border-dashed border-paper/10 pt-3">
                    <DeleteButton
                      action={deleteSchedule.bind(null, it.id)}
                      label="Hapus agenda"
                      confirmText={`Hapus agenda "${it.title}"?`}
                    />
                  </div>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

/* -------------------------------- guests -------------------------------- */

export type GuestRow = {
  id: number;
  eventId: number;
  name: string;
  role: string;
  origin: string;
  bio: string | null;
  color: string;
};

function GuestFields({ item }: { item?: GuestRow }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="Nama">
        <input name="name" required defaultValue={item?.name ?? ""} placeholder="Aya Kirana" className={inputCls} />
      </Field>
      <Field label="Peran / Judul">
        <input name="role" required defaultValue={item?.role ?? ""} placeholder="Mangaka — Rasa Nusantara" className={inputCls} />
      </Field>
      <Field label="Asal">
        <input name="origin" defaultValue={item?.origin ?? "Indonesia"} className={inputCls} />
      </Field>
      <Field label="Warna Avatar">
        <input type="color" name="color" defaultValue={item?.color ?? "#FF8A00"} className="h-10 w-20 cursor-pointer border-2 border-paper/40 bg-ink p-1" />
      </Field>
      <Field label="Bio Singkat" className="sm:col-span-2">
        <textarea name="bio" rows={2} defaultValue={item?.bio ?? ""} className={inputCls} />
      </Field>
    </div>
  );
}

export function GuestManager({ eventId, items }: { eventId: number; items: GuestRow[] }) {
  return (
    <SectionCard title="Guest Star" desc={`${items.length} kreator tamu`} accent="#8B5CF6">
      <div className="mb-5 border-2 border-dashed border-paper/25 bg-ink p-4">
        <p className="mb-3 flex items-center gap-2 font-mono text-[10px] font-bold tracking-widest text-acid uppercase">
          <Plus className="size-3.5" /> Tambah Guest Star
        </p>
        <ActionForm action={upsertGuest} submit="Tambah Guest" resetOnSuccess tone="paper">
          <input type="hidden" name="eventId" value={eventId} />
          <GuestFields />
        </ActionForm>
      </div>

      {items.length === 0 ? (
        <p className="font-mono text-xs text-paper/40">Belum ada guest star.</p>
      ) : (
        <ul className="grid gap-2.5 sm:grid-cols-2">
          {items.map((g) => (
            <li key={g.id} className="border-2 border-paper/15 bg-ink">
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
                  <span
                    className="flex size-10 shrink-0 items-center justify-center border-2 border-ink font-display text-xs text-ink"
                    style={{ backgroundColor: g.color }}
                  >
                    {g.name.slice(0, 1)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-paper/90">
                      <Mic2 className="mr-1 inline size-3 text-paper/40" />
                      {g.name}
                    </p>
                    <p className="truncate font-mono text-[9px] tracking-wider text-paper/40 uppercase">{g.role}</p>
                  </div>
                  <ChevronDown className="size-4 shrink-0 text-paper/40 transition-transform group-open:rotate-180" />
                </summary>
                <div className="border-t-2 border-paper/10 px-4 py-4">
                  <ActionForm action={upsertGuest} submit="Perbarui Guest">
                    <input type="hidden" name="id" value={g.id} />
                    <input type="hidden" name="eventId" value={eventId} />
                    <GuestFields item={g} />
                  </ActionForm>
                  <div className="mt-3 border-t-2 border-dashed border-paper/10 pt-3">
                    <DeleteButton action={deleteGuest.bind(null, g.id)} label="Hapus guest" confirmText={`Hapus ${g.name}?`} />
                  </div>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
