import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Marquee } from "@/components/marquee";

export function SiteFooter() {
  return (
    <footer className="relative z-10 mt-24 border-t-3 border-paper bg-ink">
      <Marquee
        items={[
          "COMIC WEEK",
          "SETIAP NOVEMBER",
          "JIEXPO KEMAYORAN",
          "KOMIK ORISINAL INDONESIA",
          "KOIN TINTA",
        ]}
        className="border-b-3 border-paper/20 text-paper/40"
      />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-10 md:flex-row">
          <div>
            <p className="font-display text-5xl leading-[0.9] text-paper sm:text-7xl">
              COMIC
              <br />
              <span className="text-acid">WEEK</span>
            </p>
            <p className="mt-4 max-w-xs font-mono text-xs leading-relaxed tracking-wider text-paper/50">
              Festival komik tahunan. Semua komik di situs ini adalah karya resmi yang lahir dari
              panggung Comic Week.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-12">
            <div>
              <p className="font-mono text-[10px] tracking-[0.3em] text-paper/40 uppercase">Baca</p>
              <ul className="mt-3 space-y-2 text-sm font-semibold">
                <li><Link className="hover:text-acid" href="/comics">Biblioteka Komik</Link></li>
                <li><Link className="hover:text-acid" href="/comics/neon-ronin">Neon Ronin</Link></li>
                <li><Link className="hover:text-acid" href="/comics/rasa-nusantara">Rasa Nusantara</Link></li>
                <li><Link className="hover:text-acid" href="/comics/garuda-archive">Garuda Archive</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-mono text-[10px] tracking-[0.3em] text-paper/40 uppercase">Event</p>
              <ul className="mt-3 space-y-2 text-sm font-semibold">
                <li>
                  <Link className="inline-flex items-center gap-1 text-acid hover:underline" href="/events/comic-week-2026">
                    Comic Week 2026 <ArrowUpRight className="size-3.5" />
                  </Link>
                </li>
                <li><Link className="hover:text-acid" href="/events/comic-week-2025">Arsip 2025</Link></li>
                <li><Link className="hover:text-acid" href="/events/comic-week-2024">Arsip 2024</Link></li>
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="font-mono text-[10px] tracking-[0.3em] text-paper/40 uppercase">Kabar</p>
              <ul className="mt-3 space-y-2 text-sm font-semibold">
                <li><Link className="hover:text-acid" href="/blog">Warta & Artikel</Link></li>
                <li><Link className="hover:text-acid" href="/blog?category=Pengumuman">Pengumuman</Link></li>
                <li><Link className="hover:text-acid" href="/blog?category=Kegiatan">Kegiatan Event</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t-2 border-dashed border-paper/20 pt-6 font-mono text-[10px] tracking-[0.2em] text-paper/40 uppercase">
          <span>© 2026 Comic Week Festival — Jakarta</span>
          <span className="inline-flex items-center gap-4">
            <span>Ditenagai tinta, kopi, dan deadline</span>
            <Link href="/admin" className="text-paper/25 transition-colors hover:text-acid">
              Ruang Redaksi
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
