import { readdir } from "fs/promises";
import path from "path";

/** Dimensi gambar yang diketahui (dipakai untuk kalkulasi slice otomatis). */
const KNOWN_DIMS: Record<string, { w: number; h: number }> = {
  "/covers/neon-ronin.jpg": { w: 768, h: 1376 },
  "/covers/rasa-nusantara.jpg": { w: 768, h: 1376 },
  "/covers/langit-kertas.jpg": { w: 768, h: 1376 },
  "/covers/garuda-archive.jpg": { w: 768, h: 1376 },
  "/covers/kopi-karton.jpg": { w: 768, h: 1376 },
  "/covers/sekolah-hantu.jpg": { w: 768, h: 1376 },
  "/strips/neon-ronin-strip.jpg": { w: 672, h: 1584 },
  "/strips/langit-strip.jpg": { w: 672, h: 1584 },
  "/strips/rasa-strip.jpg": { w: 768, h: 1376 },
  "/strips/garuda-strip.jpg": { w: 560, h: 1888 },
};

export type MediaItem = {
  src: string;
  label: string;
  w: number | null;
  h: number | null;
};

export async function listPublicMedia(): Promise<MediaItem[]> {
  const dirs = ["covers", "strips"];
  const out: MediaItem[] = [];
  for (const dir of dirs) {
    try {
      const files = await readdir(path.join(process.cwd(), "public", dir));
      for (const f of files.sort()) {
        if (!/\.(jpe?g|png|webp)$/i.test(f)) continue;
        const src = `/${dir}/${f}`;
        out.push({ src, label: src, w: KNOWN_DIMS[src]?.w ?? null, h: KNOWN_DIMS[src]?.h ?? null });
      }
    } catch {
      // direktori belum ada — abaikan
    }
  }
  return out;
}
