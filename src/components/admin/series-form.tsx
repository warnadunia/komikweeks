"use client";

import { useState } from "react";
import { upsertSeries, type FormState } from "@/lib/admin-actions";
import type { MediaItem } from "@/lib/media";
import { ActionForm } from "@/components/admin/action-form";
import { CheckRow, Field, inputCls, SectionCard } from "@/components/admin/fields";

export type SeriesFormDefaults = {
  id?: number;
  slug?: string;
  title?: string;
  author?: string;
  genres?: string[];
  synopsis?: string;
  status?: string;
  rating?: number;
  views?: number;
  likes?: number;
  coverImage?: string;
  featured?: boolean;
  releaseDay?: string | null;
  eventId?: number | null;
};

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

function slugify(v: string) {
  return v
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function SeriesForm({
  defaults,
  events,
  media,
}: {
  defaults: SeriesFormDefaults;
  events: { id: number; name: string }[];
  media: MediaItem[];
}) {
  const d = defaults;
  const [title, setTitle] = useState(d.title ?? "");
  const [slug, setSlug] = useState(d.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!d.id);
  const [cover, setCover] = useState(d.coverImage ?? media[0]?.src ?? "");

  const action = (prev: FormState, fd: FormData) => upsertSeries(prev, fd);

  return (
    <ActionForm action={action} submit={d.id ? "Simpan Perubahan Seri" : "Buat Judul Baru"} className="flex flex-col gap-6">
      {d.id && <input type="hidden" name="id" value={d.id} />}
      <SectionCard title="Identitas Seri" accent="#8B5CF6" desc="judul, kreator, dan rak genre">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Judul">
            <input
              name="title"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              placeholder="Neon Ronin"
              className={inputCls}
            />
          </Field>
          <Field label="Slug (URL)" hint={`Publik membaca di /comics/${slug || "…"}`}>
            <input
              name="slug"
              required
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
              className={`${inputCls} text-acid`}
            />
          </Field>
          <Field label="Kreator / Studio">
            <input name="author" required defaultValue={d.author ?? ""} placeholder="Bimo Aditya" className={inputCls} />
          </Field>
          <Field label="Genre (pisahkan koma)">
            <input name="genres" required defaultValue={(d.genres ?? []).join(", ")} placeholder="Aksi, Sci-Fi, Cyberpunk" className={inputCls} />
          </Field>
          <Field label="Sinopsis" className="sm:col-span-2">
            <textarea name="synopsis" required rows={4} defaultValue={d.synopsis ?? ""} className={inputCls} />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Terbitan & Kaitan Event" accent="#C9F73A" desc="status serialisasi dan edisi debut">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Status">
            <select name="status" defaultValue={d.status ?? "ongoing"} className={inputCls}>
              <option value="ongoing">Berjalan (ongoing)</option>
              <option value="upcoming">Akan Rilis (upcoming)</option>
              <option value="completed">Tamat (completed)</option>
            </select>
          </Field>
          <Field label="Debut di Edisi">
            <select name="eventId" defaultValue={d.eventId ? String(d.eventId) : "none"} className={inputCls}>
              <option value="none">— Tidak terkait edisi —</option>
              {events.map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Hari Rilis">
            <select name="releaseDay" defaultValue={d.releaseDay ?? ""} className={inputCls}>
              <option value="">— tidak terjadwal —</option>
              {DAYS.map((day) => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <Field label="Rating (0–10)">
            <input type="number" step="0.1" min={0} max={10} name="rating" defaultValue={d.rating ?? 9.0} className={inputCls} />
          </Field>
          <Field label="Dibaca">
            <input type="number" min={0} name="views" defaultValue={d.views ?? 0} className={inputCls} />
          </Field>
          <Field label="Suka">
            <input type="number" min={0} name="likes" defaultValue={d.likes ?? 0} className={inputCls} />
          </Field>
        </div>
        <div className="mt-4 max-w-sm">
          <CheckRow name="featured" label="Tampilkan di sorotan hub" defaultChecked={d.featured} />
        </div>
      </SectionCard>

      <SectionCard title="Sampul" accent="#35E0FF" desc="pilih dari pustaka media /public">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <Field label="Gambar Sampul" hint="Tambahkan file ke public/covers untuk pilihan baru (lengkapi dimensinya di src/lib/media.ts)">
              <select name="coverImage" value={cover} onChange={(e) => setCover(e.target.value)} className={inputCls}>
                {media.map((m) => (
                  <option key={m.src} value={m.src}>{m.label}</option>
                ))}
              </select>
            </Field>
          </div>
          {cover && (
            <div
              className="aspect-[768/1376] w-28 shrink-0 border-2 border-paper bg-cover bg-center"
              style={{ backgroundImage: `url(${cover})` }}
            />
          )}
        </div>
      </SectionCard>
    </ActionForm>
  );
}
