"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { upsertEvent, type FormState } from "@/lib/admin-actions";
import type { TicketTier } from "@/db/schema";
import { ActionForm } from "@/components/admin/action-form";
import { CheckRow, Field, inputCls, SectionCard } from "@/components/admin/fields";

export type EventFormDefaults = {
  id?: number;
  slug?: string;
  name?: string;
  edition?: string;
  theme?: string;
  tagline?: string;
  description?: string;
  city?: string;
  venue?: string;
  startLocal?: string;
  endLocal?: string;
  status?: string;
  isPublished?: boolean;
  accent?: string;
  accent2?: string;
  stats?: { artists: number; booths: number; visitors: number; series: number } | null;
  tickets?: TicketTier[] | null;
};

type TierDraft = Omit<TicketTier, "perks"> & { perksText: string };

function slugify(v: string) {
  return v
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function EventForm({ defaults }: { defaults: EventFormDefaults }) {
  const d = defaults;
  const [name, setName] = useState(d.name ?? "");
  const [slug, setSlug] = useState(d.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!d.id);
  const [tiers, setTiers] = useState<TierDraft[]>(
    (d.tickets ?? []).map((t) => ({ ...t, perksText: t.perks.join("\n") })),
  );

  const updateTier = (i: number, patch: Partial<TierDraft>) =>
    setTiers((prev) => prev.map((t, idx) => (idx === i ? { ...t, ...patch } : t)));

  const action = (prev: FormState, fd: FormData) => upsertEvent(prev, fd);

  return (
    <ActionForm action={action} submit={d.id ? "Simpan Perubahan Edisi" : "Buat Edisi & Microsite"} className="flex flex-col gap-6">
      {d.id && <input type="hidden" name="id" value={d.id} />}
      <input
        type="hidden"
        name="tickets"
        value={JSON.stringify(
          tiers.map((t) => ({
            name: t.name,
            price: Number(t.price) || 0,
            label: t.label || undefined,
            highlight: !!t.highlight,
            perks: t.perksText.split("\n").map((p) => p.trim()).filter(Boolean),
          })),
        )}
      />

      <SectionCard title="Identitas Microsite" desc="nama, slug, dan tema warna edisi">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama Event">
            <input
              name="name"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              placeholder="Comic Week 2027"
              className={inputCls}
            />
          </Field>
          <Field label="Slug (URL microsite)" hint={`Publik mengakses di /events/${slug || "…"}`}>
            <input
              name="slug"
              required
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
              placeholder="comic-week-2027"
              className={`${inputCls} text-acid`}
            />
          </Field>
          <Field label="Label Edisi" hint="Contoh: VOL. 04">
            <input name="edition" required defaultValue={d.edition ?? ""} placeholder="VOL. 04" className={inputCls} />
          </Field>
          <Field label="Tema Besar" hint="Ditampilkan sebagai headline microsite">
            <input name="theme" required defaultValue={d.theme ?? ""} placeholder="DISTORSI DUNIA" className={inputCls} />
          </Field>
          <Field label="Tagline" className="sm:col-span-2">
            <input name="tagline" defaultValue={d.tagline ?? ""} placeholder="Satu kalimat yang membakar semangat." className={inputCls} />
          </Field>
          <Field label="Deskripsi Tentang Edisi" className="sm:col-span-2">
            <textarea name="description" rows={4} defaultValue={d.description ?? ""} className={inputCls} />
          </Field>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Warna Aksen Utama" hint="Dipakai untuk tombol, bayangan, highlight microsite">
            <div className="flex items-center gap-3">
              <input type="color" name="accent" defaultValue={d.accent ?? "#C9F73A"} className="h-11 w-16 cursor-pointer border-2 border-paper/40 bg-ink p-1" />
              <span className="font-mono text-xs text-paper/50">klik untuk memilih</span>
            </div>
          </Field>
          <Field label="Warna Aksen Kedua">
            <div className="flex items-center gap-3">
              <input type="color" name="accent2" defaultValue={d.accent2 ?? "#8B5CF6"} className="h-11 w-16 cursor-pointer border-2 border-paper/40 bg-ink p-1" />
              <span className="font-mono text-xs text-paper/50">klik untuk memilih</span>
            </div>
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Waktu & Tempat" desc="semua jam dalam zona WIB" accent="#35E0FF">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Mulai">
            <input type="datetime-local" name="startDate" required defaultValue={d.startLocal ?? ""} className={inputCls} />
          </Field>
          <Field label="Selesai">
            <input type="datetime-local" name="endDate" required defaultValue={d.endLocal ?? ""} className={inputCls} />
          </Field>
          <Field label="Kota">
            <input name="city" defaultValue={d.city ?? "Jakarta"} className={inputCls} />
          </Field>
          <Field label="Venue Lengkap">
            <input name="venue" defaultValue={d.venue ?? ""} placeholder="JIExpo Kemayoran — Hall B3" className={inputCls} />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Statistik & Status" desc="angka yang tampil di strip statistik microsite" accent="#8B5CF6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="Kreator">
            <input type="number" min={0} name="statArtists" defaultValue={d.stats?.artists ?? 0} className={inputCls} />
          </Field>
          <Field label="Booth">
            <input type="number" min={0} name="statBooths" defaultValue={d.stats?.booths ?? 0} className={inputCls} />
          </Field>
          <Field label="Pengunjung">
            <input type="number" min={0} name="statVisitors" defaultValue={d.stats?.visitors ?? 0} className={inputCls} />
          </Field>
          <Field label="Judul Debut">
            <input type="number" min={0} name="statSeries" defaultValue={d.stats?.series ?? 0} className={inputCls} />
          </Field>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <Field label="Status Event">
            <select name="status" defaultValue={d.status ?? "upcoming"} className={inputCls}>
              <option value="upcoming">Segera (upcoming)</option>
              <option value="live">Berlangsung (live)</option>
              <option value="ended">Selesai (arsip)</option>
            </select>
          </Field>
          <div className="flex items-end gap-3 sm:col-span-2">
            <div className="flex-1">
              <CheckRow name="published" label="Terbitkan microsite ini" defaultChecked={d.isPublished} />
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Paket Tiket" desc="tampil di halaman Tiket microsite" accent="#FF4D00"
        actions={
          <button
            type="button"
            onClick={() => setTiers((p) => [...p, { name: "", price: 0, label: "", highlight: false, perksText: "" }])}
            className="inline-flex cursor-pointer items-center gap-1.5 border-2 border-acid bg-acid/10 px-3 py-2 font-mono text-[10px] font-bold tracking-widest text-acid uppercase transition-colors hover:bg-acid hover:text-ink"
          >
            <Plus className="size-3.5" /> Tambah Paket
          </button>
        }>
        {tiers.length === 0 && (
          <p className="font-mono text-xs text-paper/40">Belum ada paket tiket — bagian Tiket akan disembunyikan di microsite.</p>
        )}
        <div className="flex flex-col gap-4">
          {tiers.map((t, i) => (
            <div key={i} className="relative border-2 border-paper/20 bg-ink p-4">
              <button
                type="button"
                onClick={() => setTiers((p) => p.filter((_, idx) => idx !== i))}
                className="absolute top-3 right-3 flex size-7 cursor-pointer items-center justify-center border-2 border-brand/60 text-brand transition-colors hover:bg-brand hover:text-paper"
                title="Hapus paket"
              >
                <Trash2 className="size-3.5" />
              </button>
              <div className="grid gap-3 sm:grid-cols-[1.2fr_0.6fr_0.9fr]">
                <Field label="Nama Paket">
                  <input value={t.name} onChange={(e) => updateTier(i, { name: e.target.value })} placeholder="Weekend Pass" className={inputCls} />
                </Field>
                <Field label="Harga (Rp)">
                  <input type="number" min={0} value={t.price || ""} onChange={(e) => updateTier(i, { price: Number(e.target.value) })} placeholder="299000" className={inputCls} />
                </Field>
                <Field label="Label Pita (opsional)">
                  <input value={t.label ?? ""} onChange={(e) => updateTier(i, { label: e.target.value })} placeholder="Paling Laris" className={inputCls} />
                </Field>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
                <Field label="Fasilitas (satu per baris)">
                  <textarea rows={3} value={t.perksText} onChange={(e) => updateTier(i, { perksText: e.target.value })} placeholder={"Akses 4 hari\nZine resmi\nFast lane"} className={inputCls} />
                </Field>
                <label className="flex cursor-pointer items-center gap-2 self-center border-2 border-paper/25 px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={!!t.highlight}
                    onChange={(e) => updateTier(i, { highlight: e.target.checked })}
                    className="size-4 cursor-pointer appearance-none border-2 border-paper/50 bg-transparent checked:bg-acid"
                  />
                  <span className="font-mono text-[10px] font-bold tracking-widest text-paper/70 uppercase">Sorot paket ini</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </ActionForm>
  );
}
