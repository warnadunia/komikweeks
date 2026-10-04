import type { PageSlice } from "@/db/schema";

export const DEFAULT_SERIES_COVER = "/covers/default-cover.jpg";
export const DEFAULT_POST_COVER = "/covers/default-cover.jpg";
export const DEFAULT_STRIP_URL = "/strips/default-chapter-strip.jpg";

/**
 * Mengembalikan URL cover gambar yang aman.
 * Jika kosong / null / undefined, otomatis menghasilkan dummy cover resmi Comic Week.
 */
export function getSeriesCover(cover?: string | null, slug?: string): string {
  if (cover && cover.trim().length > 0) {
    return cover;
  }
  if (slug && slug.trim().length > 0) {
    return `/covers/${slug}.jpg`;
  }
  return DEFAULT_SERIES_COVER;
}

/**
 * Mengembalikan daftar slice halaman komik untuk reader vertikal.
 * Jika chapter belum memiliki halaman (kosong / null), otomatis mengembalikan
 * 5 slice dummy panel webtoon resmi Comic Week sehingga pembaca tetap dapat menikmati preview.
 */
export function getChapterSlices(
  pages?: PageSlice[] | null,
  seriesSlug = "default"
): PageSlice[] {
  if (pages && Array.isArray(pages) && pages.length > 0) {
    return pages;
  }

  const stripUrl = `/strips/${seriesSlug}-strip.jpg`;

  // 5 slice dinamis melintasi kanvas strip 768x1800 (aspek rasio 768/360)
  return [
    { src: stripUrl, ar: "768/360", pos: 0 },
    { src: stripUrl, ar: "768/360", pos: 25 },
    { src: stripUrl, ar: "768/360", pos: 50 },
    { src: stripUrl, ar: "768/360", pos: 75 },
    { src: stripUrl, ar: "768/360", pos: 100 },
  ];
}
