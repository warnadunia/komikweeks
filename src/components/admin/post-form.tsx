"use client";

import { Calendar, Copy, Globe, Image as ImageIcon, Sparkles } from "lucide-react";
import { useState } from "react";
import { upsertPost, type FormState } from "@/lib/admin-actions";
import { ActionForm } from "@/components/admin/action-form";
import { CheckRow, Field, inputCls, SectionCard } from "@/components/admin/fields";
import { BlobUploader } from "@/components/admin/blob-uploader";
import { POST_CATEGORIES } from "@/lib/blog-constants";
export { POST_CATEGORIES };

export type PostFormDefaults = {
  id?: number;
  slug?: string;
  title?: string;
  excerpt?: string | null;
  content?: string;
  coverImage?: string | null;
  category?: string;
  eventId?: number | null;
  author?: string;
  isPublished?: boolean;
};

function slugify(v: string) {
  return v
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function PostForm({
  defaults = {},
  events = [],
}: {
  defaults?: PostFormDefaults;
  events?: { id: number; name: string; edition: string; slug: string }[];
}) {
  const d = defaults;
  const [title, setTitle] = useState(d.title ?? "");
  const [slug, setSlug] = useState(d.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!d.id);
  const [cover, setCover] = useState(d.coverImage ?? "");
  const [selectedEventId, setSelectedEventId] = useState<string>(
    d.eventId ? String(d.eventId) : "none",
  );
  const [content, setContent] = useState(d.content ?? "");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const selectedEvent = events.find((e) => String(e.id) === selectedEventId);

  const copyMarkdownImg = (url: string) => {
    const md = `\n![Foto kegiatan](${url})\n`;
    navigator.clipboard.writeText(md);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const insertImageToContent = (url: string) => {
    const md = `\n![Foto kegiatan](${url})\n`;
    setContent((prev) => prev + md);
  };

  return (
    <ActionForm
      action={upsertPost}
      submit={d.id ? "Simpan Perubahan Artikel" : "Publikasikan Artikel"}
      className="flex flex-col gap-6"
    >
      {d.id && <input type="hidden" name="id" value={d.id} />}

      {/* --------------------------- Metadata Post --------------------------- */}
      <SectionCard
        title="Informasi Utama Artikel"
        accent="#C9F73A"
        desc="judul, slug url, kategori dan relasi event"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Judul Artikel / Kabar" className="sm:col-span-2">
            <input
              name="title"
              required
              value={title}
              onChange={(e) => {
                const next = e.target.value;
                setTitle(next);
                if (!slugTouched) setSlug(slugify(next));
              }}
              placeholder="Peluncuran Tiket Early Bird Comic Week 2026 Dibuka Hari Ini"
              className={inputCls}
            />
          </Field>

          <Field label="Slug URL" hint="Tautan unik pada /blog/[slug]">
            <input
              name="slug"
              required
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
              placeholder="peluncuran-tiket-early-bird-comic-week-2026"
              className={`${inputCls} font-mono text-xs text-acid`}
            />
          </Field>

          <Field label="Kategori">
            <select name="category" defaultValue={d.category ?? "general"} className={inputCls}>
              {POST_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {/* Relasi ke Event */}
        <div className="mt-4 border-2 border-paper/15 bg-ink p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <Field
                label="Hubungkan ke Event / Edisi Festival"
                hint="Jika dipilih, artikel akan otomatis muncul di microsite edisi event bersangkutan"
              >
                <select
                  name="eventId"
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className={inputCls}
                >
                  <option value="none">🌐 General Portal (Seluruh Comic Week)</option>
                  {events.map((e) => (
                    <option key={e.id} value={String(e.id)}>
                      📍 {e.name} ({e.edition})
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {selectedEvent ? (
              <div className="flex items-center gap-2 border-2 border-acid bg-acid/10 px-3 py-2 text-xs font-mono text-acid">
                <Calendar className="size-4 shrink-0" />
                <span>Terhubung ke microsite: /events/{selectedEvent.slug}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 border-2 border-paper/20 bg-paper/5 px-3 py-2 text-xs font-mono text-paper/60">
                <Globe className="size-4 shrink-0" />
                <span>Kategori Umum: Muncul di Portal Utama</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Penulis">
            <input
              name="author"
              defaultValue={d.author ?? "Redaksi Comic Week"}
              className={inputCls}
            />
          </Field>
          <div className="flex items-end pb-1">
            <CheckRow
              name="isPublished"
              label="Tayangkan sekarang (Published)"
              defaultChecked={d.isPublished ?? true}
            />
          </div>
        </div>
      </SectionCard>

      {/* --------------------------- Foto Sampul & Upload --------------------------- */}
      <SectionCard
        title="Foto Sampul & Dokumentasi"
        accent="#8B5CF6"
        desc="unggah foto langsung ke Vercel Blob (otomatis WebP 80%)"
      >
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex flex-1 flex-col gap-3">
            <Field label="URL Foto Sampul" hint="URL gambar dari Vercel Blob atau link eksternal">
              <input
                type="text"
                name="coverImage"
                value={cover}
                onChange={(e) => setCover(e.target.value)}
                placeholder="https://...blob.vercel-storage.com/... atau /covers/..."
                className={inputCls}
              />
            </Field>

            <BlobUploader
              folder="comics"
              multiple={false}
              label="Unggah Foto Sampul ke Vercel Blob (Otomatis WebP 80%)"
              onSuccess={(results) => {
                if (results[0]) {
                  setCover(results[0].url);
                }
              }}
            />
          </div>

          {cover && (
            <div className="w-full sm:w-44 shrink-0">
              <span className="mb-1 block font-mono text-[9px] tracking-widest text-paper/45 uppercase">
                Pratinjau Sampul
              </span>
              <div
                className="aspect-[16/10] w-full border-2 border-paper bg-cover bg-center shadow-[4px_4px_0_#8B5CF6]"
                style={{ backgroundImage: `url(${cover})` }}
              />
            </div>
          )}
        </div>

        {/* Upload Foto Tambahan untuk Konten */}
        <div className="mt-6 border-t-2 border-dashed border-paper/15 pt-4">
          <p className="flex items-center gap-1.5 font-mono text-xs font-bold text-paper/80 uppercase">
            <ImageIcon className="size-3.5 text-acid" /> Sisipkan Foto ke Dalam Konten Artikel
          </p>
          <p className="mt-1 font-mono text-[11px] text-paper/50">
            Unggah foto dokumentasi kegiatan di sini, lalu klik &quot;Sisipkan ke Artikel&quot;
          </p>

          <div className="mt-3">
            <BlobUploader
              folder="events"
              multiple={true}
              label="Unggah Foto Kegiatan ke Vercel Blob"
              onSuccess={(results) => {
                // Beri opsi sisipkan foto
                results.forEach((r) => {
                  insertImageToContent(r.url);
                });
              }}
            />
          </div>
        </div>
      </SectionCard>

      {/* --------------------------- Isi Konten --------------------------- */}
      <SectionCard title="Konten Artikel" accent="#FF4D00" desc="ringkasan dan isi lengkap">
        <div className="flex flex-col gap-4">
          <Field
            label="Ringkasan Singkat (Excerpt)"
            hint="Ditampilkan pada kartu daftar blog dan preview kartu sosial"
          >
            <textarea
              name="excerpt"
              rows={2}
              defaultValue={d.excerpt ?? ""}
              placeholder="Deskripsi singkat artikel dalam 1-2 kalimat..."
              className={inputCls}
            />
          </Field>

          <Field
            label="Isi Artikel Lengkap"
            hint="Mendukung teks biasa dan format Markdown (contoh: ![gambar](url), ## Subjudul, **tebal**, [tautan](url))"
          >
            <textarea
              name="content"
              required
              rows={12}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tuliskan berita, liputan, atau pengumuman di sini..."
              className={`${inputCls} font-sans leading-relaxed`}
            />
          </Field>
        </div>
      </SectionCard>
    </ActionForm>
  );
}
