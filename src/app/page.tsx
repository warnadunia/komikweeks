import { ArrowRight, ArrowUpRight, BookOpen, CalendarDays, Coins, Lock, MapPin, Sparkles } from "lucide-react";
import Link from "next/link";
import { Countdown } from "@/components/countdown";
import { Floaty } from "@/components/floaty";
import { Marquee } from "@/components/marquee";
import { Reveal } from "@/components/reveal";
import { SeriesCard } from "@/components/series-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { TicketBuyButton } from "@/components/ticket-buy";
import { dateRange, formatCompact } from "@/lib/utils";
import { getFeaturedEvent, getPublishedEvents, getSeriesCards } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, events, allSeries] = await Promise.all([
    getFeaturedEvent(),
    getPublishedEvents(),
    getSeriesCards(),
  ]);
  const featuredSeries = allSeries.filter((s) => s.featured).slice(0, 4);
  const heroCovers = allSeries.slice(0, 3);

  return (
    <div className="relative">
      <SiteNav />

      {/* ------------------------------- HERO ------------------------------- */}
      <section className="halftone-dark relative overflow-hidden border-b-3 border-paper">
        <div className="pointer-events-none absolute -top-10 -right-24 select-none font-display text-[26rem] leading-none text-hollow opacity-[0.07]">
          {featured ? featured.edition.replace("VOL. ", "0").replace(" ", "") : "03"}
        </div>
        <div className="mx-auto grid max-w-7xl gap-10 px-4 pt-14 pb-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-6 lg:pt-24 lg:pb-24">
          <div className="relative z-10">
            <Reveal>
              <p className="inline-flex items-center gap-2 border-2 border-acid bg-ink px-3 py-1.5 font-mono text-[10px] font-bold tracking-[0.3em] text-acid uppercase sm:text-xs">
                <Sparkles className="size-3.5" />
                Festival Komik Tahunan — Est. 2024
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mt-6 font-display text-[17vw] leading-[0.82] tracking-tight text-paper uppercase sm:text-8xl lg:text-[7.5rem]">
                Comic
                <br />
                <span className="text-hollow-accent">Week</span>
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-paper/70 sm:text-lg">
                Satu minggu setiap tahun ketika komik Indonesia mengambil alih kota. Temui
                kreatornya di festival — lalu baca karya orisinal mereka panel demi panel, hanya di
                sini.
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="mt-8 flex flex-wrap gap-3">
                {featured && (
                  <Link
                    href={`/events/${featured.slug}`}
                    className="group inline-flex items-center gap-2 border-3 border-ink bg-acid px-6 py-4 font-display text-sm tracking-wide text-ink uppercase shadow-[6px_6px_0_#f5f1e8] transition-all hover:-translate-y-1 hover:shadow-[9px_9px_0_#f5f1e8]"
                  >
                    <CalendarDays className="size-4" strokeWidth={2.5} />
                    Masuk Microsite {featured.edition}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                )}
                <Link
                  href="/comics"
                  className="group inline-flex items-center gap-2 border-3 border-paper bg-ink px-6 py-4 font-display text-sm tracking-wide text-paper uppercase shadow-[6px_6px_0_rgba(245,241,232,0.35)] transition-all hover:-translate-y-1 hover:bg-paper hover:text-ink hover:shadow-[9px_9px_0_#c9f73a]"
                >
                  <BookOpen className="size-4" strokeWidth={2.5} />
                  Baca Komik
                </Link>
              </div>
            </Reveal>
            <Reveal delay={0.32}>
              <div className="mt-10 grid max-w-lg grid-cols-3 divide-x-3 divide-paper/20 border-3 border-paper/25 bg-ink-soft">
                {[
                  { v: `${allSeries.length * 7}+`, l: "Judul Komik" },
                  { v: featured ? formatCompact(featured.stats?.visitors ?? 0) : "120 rb", l: "Pengunjung" },
                  { v: `${events.length}`, l: "Edisi Tahunan" },
                ].map((s) => (
                  <div key={s.l} className="px-4 py-3.5">
                    <p className="font-display text-xl text-acid sm:text-2xl">{s.v}</p>
                    <p className="mt-1 font-mono text-[9px] tracking-[0.18em] text-paper/50 uppercase sm:text-[10px]">
                      {s.l}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* cover collage */}
          <div className="relative mx-auto h-105 w-full max-w-md lg:h-auto lg:max-w-none">
            {heroCovers.map((s, i) => (
              <Floaty
                key={s.id}
                delay={0.15 + i * 0.18}
                amount={10 + i * 3}
                duration={5 + i}
                className={
                  i === 0
                    ? "absolute top-0 left-[4%] w-[52%] rotate-[-5deg]"
                    : i === 1
                      ? "absolute top-[14%] right-[2%] w-[50%] rotate-[4deg]"
                      : "absolute bottom-[-4%] left-[22%] w-[52%] rotate-[-1.5deg]"
                }
              >
                <Link href={`/comics/${s.slug}`} className="group block">
                  <div
                    className="aspect-[768/1376] w-full border-3 border-paper bg-cover bg-center shadow-[8px_8px_0_rgba(245,241,232,0.9)] transition-all duration-300 group-hover:border-acid group-hover:shadow-[12px_12px_0_#ff4d00]"
                    style={{ backgroundImage: `url(${s.coverImage})` }}
                  />
                  <p className="mt-2 text-center font-marker text-lg text-acid">
                    {s.title}
                    <span className="ml-2 inline-block rotate-12">★</span>
                  </p>
                </Link>
              </Floaty>
            ))}
          </div>
        </div>
      </section>

      <div className="stripes-danger h-4 border-b-3 border-ink" />
      <Marquee
        items={["KOMIK ORISINAL", "FESTIVAL TAHUNAN", "ARTIST ALLEY", "KOIN TINTA", "GUEST STAR INTERNASIONAL", "WORKSHOP & LIVE DRAWING"]}
        className="border-b-3 border-paper/20 bg-ink text-paper/70"
      />
      <div className="stripes-danger h-4 border-t-3 border-b-3 border-ink" />

      {/* ------------------------- MICROSITE SPOTLIGHT ------------------------- */}
      {featured && (
        <section className="relative overflow-hidden" style={{ "--ev-accent": featured.accent } as React.CSSProperties}>
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-xs font-bold tracking-[0.3em] uppercase" style={{ color: featured.accent }}>
                    ● {featured.status === "upcoming" ? "Edisi Terdekat" : featured.status === "live" ? "Sedang Berlangsung" : "Edisi Terakhir"}
                  </p>
                  <h2 className="mt-3 font-display text-4xl leading-[0.9] text-paper uppercase sm:text-6xl">
                    {featured.edition}
                    <br />
                    <span className="text-hollow" style={{ WebkitTextStrokeColor: featured.accent }}>
                      {featured.theme}
                    </span>
                  </h2>
                </div>
                {featured.status === "upcoming" && (
                  <div className="flex flex-col items-start gap-2">
                    <span className="font-mono text-[10px] tracking-[0.25em] text-paper/50 uppercase">Gerbang dibuka dalam</span>
                    <Countdown target={featured.startDate.toISOString()} />
                  </div>
                )}
              </div>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="mt-8 flex flex-col gap-6 border-3 border-paper bg-ink-soft p-6 shadow-[8px_8px_0_var(--ev-accent)] sm:p-8 lg:flex-row lg:items-center">
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 border-2 border-paper/40 px-2.5 py-1 font-mono text-[10px] font-bold tracking-widest text-paper/80 uppercase">
                      <CalendarDays className="size-3.5" />
                      {dateRange(featured.startDate, featured.endDate)}
                    </span>
                    <span className="inline-flex items-center gap-1.5 border-2 border-paper/40 px-2.5 py-1 font-mono text-[10px] font-bold tracking-widest text-paper/80 uppercase">
                      <MapPin className="size-3.5" />
                      {featured.venue}
                    </span>
                  </div>
                  <p className="mt-4 max-w-2xl leading-relaxed text-paper/70">{featured.tagline}</p>
                  <p className="mt-3 font-mono text-[11px] tracking-wider text-paper/45 uppercase">
                    Semua info edisi ini — jadwal, guest star, tiket — hanya ada di microsite-nya.
                  </p>
                </div>
                <Link
                  href={`/events/${featured.slug}`}
                  className="group inline-flex shrink-0 items-center gap-2 border-3 border-ink px-6 py-4 font-display text-sm tracking-wide text-ink uppercase shadow-[5px_5px_0_#0a0a0e] transition-all hover:-translate-y-1 hover:shadow-[8px_8px_0_#0a0a0e]"
                  style={{ backgroundColor: featured.accent }}
                >
                  Buka Microsite {featured.edition}
                  <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ---------------------------- FEATURED COMICS ---------------------------- */}
      <section className="relative border-t-3 border-paper/15">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-marker text-xl text-brand">karya orisinal, lahir di panggung</p>
                <h2 className="font-display text-4xl text-paper uppercase sm:text-6xl">
                  Biblioteka <span className="text-acid">Comic Week</span>
                </h2>
              </div>
              <Link
                href="/comics"
                className="group inline-flex items-center gap-2 border-b-3 border-acid pb-1 font-mono text-xs font-bold tracking-[0.2em] text-acid uppercase transition-colors hover:text-paper"
              >
                Lihat Semua Judul
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </Reveal>
          <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
            {featuredSeries.map((s, i) => (
              <Reveal key={s.id} delay={i * 0.08}>
                <SeriesCard s={s} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------- HOW TO READ ----------------------------- */}
      <section className="halftone-dark border-y-3 border-paper bg-ink-soft">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <Reveal>
            <h2 className="text-center font-display text-3xl text-paper uppercase sm:text-5xl">
              Cara Membaca di <span className="text-hollow-accent">Comic Week</span>
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                n: "01",
                icon: Coins,
                title: "Klaim Koin Tinta",
                desc: "Setiap pembaca baru mendapat 100 Koin Tinta sambutan — gratis, tanpa daftar, tanpa kartu.",
                accent: "bg-acid",
              },
              {
                n: "02",
                icon: BookOpen,
                title: "Baca Chapter Gratis",
                desc: "Chapter pertama setiap judul selalu terbuka untuk semua. Gulir vertikal seperti webtoon.",
                accent: "bg-paper",
              },
              {
                n: "03",
                icon: Lock,
                title: "Buka Chapter Premium",
                desc: "Chapter lanjutan dibuka dengan Koin Tinta — milikmu permanen, dan dukungan mengalir ke kreator.",
                accent: "bg-brand",
              },
            ].map((c, i) => (
              <Reveal key={c.n} delay={i * 0.1}>
                <div className="group relative h-full border-3 border-paper bg-ink p-6 transition-all hover:-translate-y-2 hover:shadow-[10px_10px_0_#c9f73a] sm:p-7">
                  <span className="absolute -top-4 left-5 border-3 border-ink bg-paper px-2.5 py-1 font-display text-sm text-ink shadow-[3px_3px_0_#000]">
                    {c.n}
                  </span>
                  <span className={`inline-flex size-12 items-center justify-center border-3 border-ink ${c.accent} text-ink shadow-[4px_4px_0_#000]`}>
                    <c.icon className="size-6" strokeWidth={2.5} />
                  </span>
                  <h3 className="mt-5 font-display text-xl text-paper uppercase">{c.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-paper/60">{c.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------- EDITIONS ARCHIVE ----------------------------- */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <Reveal>
          <p className="font-marker text-xl text-acid">setiap edisi punya rumahnya sendiri</p>
          <h2 className="font-display text-4xl text-paper uppercase sm:text-6xl">Arsip Edisi</h2>
          <p className="mt-3 max-w-xl text-paper/60">
            Informasi tiap Comic Week tidak menumpuk di situs utama — ia tinggal selamanya di
            microsite edisinya masing-masing.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {events.map((ev, i) => (
            <Reveal key={ev.id} delay={i * 0.1}>
              <Link
                href={`/events/${ev.slug}`}
                className="group relative block h-full border-3 border-paper bg-ink-soft p-6 transition-all hover:-translate-y-2 sm:p-7"
                style={{ "--tw-shadow": "8px 8px 0 0", boxShadow: `8px 8px 0 ${ev.accent}` } as React.CSSProperties}
              >
                <div className="flex items-start justify-between">
                  <span
                    className="border-3 border-ink px-2.5 py-1 font-display text-xs text-ink shadow-[3px_3px_0_#000]"
                    style={{ backgroundColor: ev.accent }}
                  >
                    {ev.edition}
                  </span>
                  <span
                    className={`rotate-3 border-2 px-2 py-1 font-mono text-[9px] font-bold tracking-widest uppercase ${
                      ev.status === "upcoming"
                        ? "border-acid bg-acid/10 text-acid"
                        : ev.status === "live"
                          ? "border-brand bg-brand/10 text-brand"
                          : "border-paper/40 text-paper/50"
                    }`}
                  >
                    {ev.status === "upcoming" ? "Segera" : ev.status === "live" ? "Live" : "Selesai"}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-2xl leading-tight text-paper uppercase group-hover:underline">
                  {ev.theme}
                </h3>
                <p className="mt-2 font-mono text-[10px] tracking-[0.2em] text-paper/50 uppercase">
                  {dateRange(ev.startDate, ev.endDate)}
                </p>
                <p className="mt-1 font-mono text-[10px] tracking-[0.2em] text-paper/50 uppercase">{ev.venue}</p>
                <div className="mt-5 flex items-center gap-2 font-mono text-xs font-bold tracking-widest uppercase" style={{ color: ev.accent }}>
                  Buka Microsite
                  <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------- BIG CTA ------------------------------- */}
      {featured?.status === "upcoming" && (featured.tickets?.[1] ?? null) && (
        <section className="stripes-danger border-y-4 border-ink">
          <div className="bg-ink/30 px-4 py-16 backdrop-blur-[2px] sm:px-6">
            <Reveal>
              <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
                <p className="font-marker text-2xl text-ink">jangan jadi penonton epilog —</p>
                <h2 className="mt-2 font-display text-4xl text-ink uppercase drop-shadow-[3px_3px_0_rgba(245,241,232,0.9)] sm:text-6xl">
                  Amankan Kursimu di {featured.theme}
                </h2>
                <div className="mt-8 w-full max-w-sm">
                  <TicketBuyButton tierName="Weekend Pass" />
                </div>
                <Link href={`/events/${featured.slug}#tiket`} className="mt-4 font-mono text-xs font-bold tracking-widest text-ink underline underline-offset-4">
                  Lihat semua paket tiket →
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      <SiteFooter />
    </div>
  );
}
