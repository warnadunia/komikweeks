"use client";

import { ChevronDown, Lock, Plus, Sparkles, Trash2, Wand2 } from "lucide-react";
import { useState } from "react";
import type { PageSlice } from "@/db/schema";
import type { MediaItem } from "@/lib/media";
import { deleteChapter, upsertChapter } from "@/lib/admin-actions";
import { ActionForm, DeleteButton } from "@/components/admin/action-form";
import { CheckRow, Field, inputCls, SectionCard } from "@/components/admin/fields";
import { R2Uploader } from "@/components/admin/r2-uploader";

export type ChapterRow = {
  id: number;
  number: number;
  title: string;
  publishedAtLocal: string; // YYYY-MM-DD (WIB)
  isFree: boolean;
  priceCoins: number;
  isPublished: boolean;
  pages: PageSlice[];
};

/* ------------------------------ pages editor ------------------------------ */

function Stepper({
  value,
  onChange,
  min = 1,
  max = 99,
  label,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  label: string;
}) {
  return (
    <div>
      <span className="mb-1 block font-mono text-[9px] tracking-widest text-paper/45 uppercase">{label}</span>
      <div className="flex items-stretch border-2 border-paper/25">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} className="cursor-pointer px-2.5 text-paper/60 hover:bg-paper/10">−</button>
        <span className="flex-1 border-x-2 border-paper/25 py-1.5 text-center font-mono text-xs font-bold">{value}</span>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} className="cursor-pointer px-2.5 text-paper/60 hover:bg-paper/10">+</button>
      </div>
    </div>
  );
}

export function PagesEditor({
  initialPages,
  media,
  inputName = "pages",
}: {
  initialPages: PageSlice[];
  media: MediaItem[];
  inputName?: string;
}) {
  const [pages, setPages] = useState<PageSlice[]>(initialPages);
  const [availableMedia, setAvailableMedia] = useState<MediaItem[]>(media);
  const [genSrc, setGenSrc] = useState(
    media.find((m) => m.w && m.h)?.src ?? media[0]?.src ?? "",
  );
  const [genCount, setGenCount] = useState(5);
  const [genFrom, setGenFrom] = useState(1);
  const [genTo, setGenTo] = useState(3);

  const genMedia = availableMedia.find((m) => m.src === genSrc);

  const addGenerated = () => {
    if (!genMedia?.w || !genMedia.h) return;
    const from = Math.max(1, Math.min(genFrom, genCount));
    const to = Math.max(from, Math.min(genTo, genCount));
    const sliceH = genMedia.h / genCount;
    const next: PageSlice[] = [];
    for (let k = from - 1; k <= to - 1; k++) {
      const pos =
        genCount === 1 ? 0 : Math.round(((100 * k) / (genCount - 1)) * 10000) / 10000;
      next.push({
        src: genMedia.src,
        pos,
        ar: `${genMedia.w}/${Math.round(sliceH * 1000) / 1000}`,
      });
    }
    setPages((p) => [...p, ...next]);
  };

  const update = (i: number, patch: Partial<PageSlice>) =>
    setPages((p) => p.map((pg, idx) => (idx === i ? { ...pg, ...patch } : pg)));

  const move = (i: number, dir: -1 | 1) =>
    setPages((p) => {
      const arr = [...p];
      const j = i + dir;
      if (j < 0 || j >= arr.length) return p;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return arr;
    });

  return (
    <div className="border-2 border-paper/20 bg-ink-soft p-4">
      <input type="hidden" name={inputName} value={JSON.stringify(pages)} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-[10px] font-bold tracking-widest text-paper/60 uppercase">
          Halaman ({pages.length}) — urutan atas → bawah seperti webtoon
        </p>
        <button
          type="button"
          onClick={() =>
            setPages((p) => [
              ...p,
              { src: availableMedia[0]?.src ?? "", pos: 50, ar: "16/9" },
            ])
          }
          className="inline-flex cursor-pointer items-center gap-1.5 border-2 border-paper/40 px-2.5 py-1.5 font-mono text-[9px] font-bold tracking-widest text-paper/70 uppercase hover:border-acid hover:text-acid"
        >
          <Plus className="size-3" /> Halaman Manual
        </button>
      </div>

      {/* R2 Uploader Box */}
      <div className="mt-3">
        <R2Uploader
          folder="chapters"
          multiple
          label="Unggah Halaman Komik ke Cloudflare R2 (Otomatis WebP 80%)"
          onSuccess={(results) => {
            const newMediaList: MediaItem[] = results.map((r) => ({
              src: r.publicUrl,
              label: `[R2] ${r.key.split("/").pop()} (${r.width}×${r.height})`,
              w: r.width,
              h: r.height,
            }));
            setAvailableMedia((prev) => [...newMediaList, ...prev]);

            // Jika belum ada genSrc terpilih yang punya dimensi, jadikan yang baru
            if (results[0]) {
              setGenSrc(results[0].publicUrl);
            }

            // Tambahkan langsung ke daftar halaman bab
            const newPages: PageSlice[] = results.map((r) => ({
              src: r.publicUrl,
              pos: 50,
              ar: r.aspectRatio,
            }));
            setPages((p) => [...p, ...newPages]);
          }}
        />
      </div>

      {pages.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2">
          {pages.map((pg, i) => {
            const m = availableMedia.find((x) => x.src === pg.src);
            return (
              <li
                key={i}
                className="flex items-center gap-2 border-2 border-paper/15 bg-ink p-2"
              >
                <div className="flex shrink-0 flex-col">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    className="cursor-pointer px-1 text-[9px] text-paper/50 hover:text-acid"
                  >
                    ▲
                  </button>
                  <span className="flex size-7 items-center justify-center font-mono text-[10px] font-bold text-paper/60">
                    {i + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    className="cursor-pointer px-1 text-[9px] text-paper/50 hover:text-acid"
                  >
                    ▼
                  </button>
                </div>
                <div
                  className="h-14 w-16 shrink-0 border border-paper/25 bg-cover"
                  style={{
                    backgroundImage: `url(${pg.src})`,
                    backgroundPosition: `50% ${pg.pos}%`,
                    backgroundSize: "100% auto",
                  }}
                />
                <div className="grid min-w-0 flex-1 grid-cols-[1fr_auto_auto] items-end gap-2">
                  <Field label="Sumber Gambar">
                    <select
                      value={pg.src}
                      onChange={(e) => update(i, { src: e.target.value })}
                      className={`${inputCls} py-1.5 text-xs`}
                    >
                      {availableMedia.map((opt) => (
                        <option key={opt.src} value={opt.src}>
                          {opt.label}
                        </option>
                      ))}
                      {!availableMedia.some((opt) => opt.src === pg.src) && (
                        <option value={pg.src}>{pg.src}</option>
                      )}
                    </select>
                  </Field>
                  <Field label="Pos %">
                    <input
                      type="number"
                      step="0.01"
                      value={pg.pos}
                      onChange={(e) => update(i, { pos: Number(e.target.value) })}
                      className={`${inputCls} w-20 py-1.5 text-xs`}
                    />
                  </Field>
                  <Field label="Rasio (w/h)">
                    <input
                      value={pg.ar}
                      onChange={(e) => update(i, { ar: e.target.value })}
                      className={`${inputCls} w-24 py-1.5 text-xs${m ? "" : " text-brand"}`}
                    />
                  </Field>
                </div>
                <button
                  type="button"
                  onClick={() => setPages((p) => p.filter((_, idx) => idx !== i))}
                  className="flex size-7 shrink-0 cursor-pointer items-center justify-center border-2 border-brand/60 text-brand hover:bg-brand hover:text-paper"
                  title="Hapus halaman"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* slice generator */}
      <div className="mt-4 border-2 border-dashed border-acid/40 bg-acid/5 p-3">
        <p className="flex items-center gap-2 font-mono text-[9px] font-bold tracking-widest text-acid uppercase">
          <Wand2 className="size-3.5" /> Generator Slice Otomatis
        </p>
        <div className="mt-2.5 grid grid-cols-2 items-end gap-2 sm:grid-cols-[1fr_auto_auto_auto_auto]">
          <Field label="Gambar strip">
            <select
              value={genSrc}
              onChange={(e) => setGenSrc(e.target.value)}
              className={`${inputCls} py-1.5 text-xs`}
            >
              {availableMedia.map((opt) => (
                <option key={opt.src} value={opt.src} disabled={!opt.w}>
                  {opt.label}
                  {opt.w ? ` (${opt.w}×${opt.h})` : " (dimensi ?)"}
                </option>
              ))}
            </select>
          </Field>
          <Stepper label="Potong jadi" value={genCount} onChange={setGenCount} min={2} max={12} />
          <Stepper label="Ambil dari" value={genFrom} onChange={setGenFrom} min={1} max={genCount} />
          <Stepper label="Sampai" value={genTo} onChange={setGenTo} min={1} max={genCount} />
          <button
            type="button"
            onClick={addGenerated}
            disabled={!genMedia?.w}
            className="inline-flex cursor-pointer items-center gap-1.5 border-2 border-ink bg-acid px-3 py-2 font-mono text-[10px] font-bold tracking-widest text-ink uppercase shadow-[2px_2px_0_#000] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Sparkles className="size-3.5" /> Generate
          </button>
        </div>
        <p className="mt-2 font-mono text-[9px] leading-relaxed text-paper/40">
          Memecah satu gambar vertikal menjadi N potong mulus (tanpa celah/tumpang tindih), lalu
          menambahkan potongan terpilih ke daftar halaman.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------ chapter fields ----------------------------- */

function ChapterFields({ media, chapter }: { media: MediaItem[]; chapter?: ChapterRow }) {
  const [isFree, setIsFree] = useState(chapter?.isFree ?? false);
  const [published, setPublished] = useState(chapter?.isPublished ?? true);
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <Field label="No. Chapter">
          <input type="number" min={1} name="number" required defaultValue={chapter?.number ?? 1} className={inputCls} />
        </Field>
        <Field label="Judul" className="sm:col-span-2">
          <input name="title" required defaultValue={chapter?.title ?? ""} placeholder="Hujan di Sektor 9" className={inputCls} />
        </Field>
        <Field label="Tanggal Terbit">
          <input type="date" name="publishedAt" required defaultValue={chapter?.publishedAtLocal ?? ""} className={inputCls} />
        </Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-[auto_auto_1fr]">
        <label className={`flex cursor-pointer items-center gap-2.5 border-2 px-3 py-2.5 transition-colors ${isFree ? "border-acid bg-acid/10" : "border-paper/25"}`}>
          <input
            type="checkbox"
            name="isFree"
            checked={isFree}
            onChange={(e) => setIsFree(e.target.checked)}
            className="size-4 cursor-pointer appearance-none border-2 border-paper/50 bg-ink checked:bg-acid"
          />
          <span className="font-mono text-xs font-bold tracking-wider text-paper/80 uppercase">Gratis</span>
        </label>
        <Field label="">
          <div className={`flex items-center gap-2 border-2 px-3 py-2 transition-opacity ${isFree ? "pointer-events-none border-paper/15 opacity-35" : "border-paper/25"}`}>
            <Lock className="size-3.5 shrink-0 text-paper/50" />
            <input type="number" min={0} name="priceCoins" defaultValue={chapter?.priceCoins ?? 30} className="w-full bg-transparent font-mono text-sm text-paper outline-none" />
            <span className="font-mono text-[9px] tracking-widest text-paper/45 uppercase">Koin</span>
          </div>
        </Field>
        <div className="flex items-end pb-0.5">
          <label className={`flex w-full cursor-pointer items-center gap-2.5 border-2 px-3 py-2.5 transition-colors ${published ? "border-sky/70 bg-sky/10" : "border-paper/25"}`}>
            <input type="checkbox" name="isPublished" checked={published} onChange={(e) => setPublished(e.target.checked)} className="size-4 cursor-pointer appearance-none border-2 border-paper/50 bg-ink checked:bg-sky" />
            <span className="font-mono text-xs font-bold tracking-wider text-paper/80 uppercase">Terbit sekarang</span>
          </label>
        </div>
      </div>
      <PagesEditor media={media} initialPages={chapter?.pages ?? []} />
    </div>
  );
}

/* ------------------------------ chapter manager ---------------------------- */

export function ChapterManager({
  seriesId,
  chapters,
  media,
}: {
  seriesId: number;
  chapters: ChapterRow[];
  media: MediaItem[];
}) {
  const sorted = [...chapters].sort((a, b) => a.number - b.number);
  const nextNumber = Math.max(0, ...chapters.map((c) => c.number)) + 1;

  return (
    <SectionCard
      title="Chapter"
      desc={`${chapters.filter((c) => c.isPublished).length} terbit · ${chapters.length} total`}
      accent="#FF4D00"
    >
      <details className="group mb-5 border-2 border-dashed border-paper/25 bg-ink open:border-acid/60">
        <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3.5 font-mono text-[10px] font-bold tracking-widest text-acid uppercase [&::-webkit-details-marker]:hidden">
          <Plus className="size-3.5" /> Rilis Chapter Baru (disarankan no. {nextNumber})
          <ChevronDown className="ml-auto size-4 text-paper/40 transition-transform group-open:rotate-180" />
        </summary>
        <div className="border-t-2 border-paper/10 px-4 py-4">
          <ActionForm action={upsertChapter} submit="Simpan Chapter" resetOnSuccess tone="paper">
            <input type="hidden" name="seriesId" value={seriesId} />
            <ChapterFields media={media}
              chapter={{
                id: 0,
                number: nextNumber,
                title: "",
                publishedAtLocal: "",
                isFree: false,
                priceCoins: 30,
                isPublished: true,
                pages: [],
              }}
            />
          </ActionForm>
        </div>
      </details>

      {sorted.length === 0 ? (
        <p className="font-mono text-xs text-paper/40">Belum ada chapter.</p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {sorted.map((c) => (
            <li key={c.id} className={`border-2 bg-ink ${c.isPublished ? "border-paper/15" : "border-dashed border-paper/20"}`}>
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
                  <span className={`flex size-10 shrink-0 items-center justify-center border-2 font-display text-xs ${c.isPublished ? "border-ink bg-paper text-ink" : "border-paper/25 text-paper/40"}`}>
                    {String(c.number).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-paper/90">{c.title}</p>
                    <p className="truncate font-mono text-[9px] tracking-wider text-paper/40 uppercase">
                      {c.publishedAtLocal || "?"} · {c.pages.length} halaman
                    </p>
                  </div>
                  {c.isFree ? (
                    <span className="shrink-0 border-2 border-ink bg-acid px-2 py-0.5 font-mono text-[9px] font-bold text-ink uppercase">Gratis</span>
                  ) : (
                    <span className="shrink-0 border-2 border-ink bg-paper px-2 py-0.5 font-mono text-[9px] font-bold text-ink uppercase">
                      {c.priceCoins} Koin
                    </span>
                  )}
                  {!c.isPublished && (
                    <span className="shrink-0 border-2 border-brand/60 px-2 py-0.5 font-mono text-[9px] font-bold text-brand uppercase">Draft</span>
                  )}
                  <ChevronDown className="size-4 shrink-0 text-paper/40 transition-transform group-open:rotate-180" />
                </summary>
                <div className="border-t-2 border-paper/10 px-4 py-4">
                  <ActionForm action={upsertChapter} submit="Perbarui Chapter">
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="seriesId" value={seriesId} />
                    <ChapterFields media={media} chapter={c} />
                  </ActionForm>
                  <div className="mt-3 border-t-2 border-dashed border-paper/10 pt-3">
                    <DeleteButton
                      action={deleteChapter.bind(null, c.id)}
                      label="Hapus chapter"
                      confirmText={`Hapus Chapter ${c.number} “${c.title}”? Unlock pembaca terkait ikut terhapus.`}
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
