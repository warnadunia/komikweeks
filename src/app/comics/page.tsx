import type { Metadata } from "next";
import { LibraryBig } from "lucide-react";
import { ComicExplorer } from "@/components/comic-explorer";
import { Marquee } from "@/components/marquee";
import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { getSeriesCards } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Biblioteka Komik",
  description:
    "Semua komik orisinal produksi Comic Week. Baca chapter pertama gratis, buka kelanjutannya dengan Koin Tinta.",
};

export default async function ComicsPage() {
  const series = await getSeriesCards();

  return (
    <div>
      <SiteNav />
      <Marquee
        items={["CHAPTER 1 SELALU GRATIS", "BACA VERTIKAL SEPERTI WEBTOON", "DUKUNG KREATOR DENGAN KOIN TINTA", "JUDUL BARU TIAP EDISI"]}
        fast
        className="border-b-3 border-paper/20 bg-ink text-paper/60"
      />
      <header className="halftone-dark relative overflow-hidden border-b-3 border-paper">
        <div className="pointer-events-none absolute -right-8 -bottom-16 select-none font-display text-[13rem] leading-none text-hollow opacity-10">
          BACA
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
          <Reveal>
            <p className="inline-flex items-center gap-2 border-2 border-acid px-3 py-1.5 font-mono text-[10px] font-bold tracking-[0.3em] text-acid uppercase sm:text-xs">
              <LibraryBig className="size-3.5" />
              Produk Resmi Festival
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-5 font-display text-5xl leading-[0.85] text-paper uppercase sm:text-7xl">
              Biblioteka
              <br />
              <span className="text-acid">Comic Week</span>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-5 max-w-xl leading-relaxed text-paper/65">
              Setiap judul di rak ini debut di atas panggung Comic Week. Chapter pertama selalu
              gratis — kelanjutannya kamu buka dengan Koin Tinta, dan setiap koin adalah dukungan
              nyata untuk kreatornya.
            </p>
          </Reveal>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <ComicExplorer series={series} />
      </main>

      <SiteFooter />
    </div>
  );
}
