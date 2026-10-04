import type { Metadata } from "next";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  MapPin,
  Newspaper,
  Sparkles,
  Star,
  Ticket,
  Users,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Countdown } from "@/components/countdown";
import { Floaty } from "@/components/floaty";
import { Marquee } from "@/components/marquee";
import { Reveal } from "@/components/reveal";
import { ScheduleTabs } from "@/components/schedule-tabs";
import { TicketBuyButton } from "@/components/ticket-buy";
import { getEventBundle, getPostsForEvent, getPublishedEvents } from "@/lib/queries";
import { dateRange, formatCompact, formatIDR } from "@/lib/utils";
import { getSeriesCover } from "@/lib/dummy-images";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const bundle = await getEventBundle(slug);
  if (!bundle) return { title: "Microsite tidak ditemukan" };
  return {
    title: `${bundle.event.name} — ${bundle.event.theme}`,
    description: bundle.event.tagline ?? undefined,
  };
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function EventMicrosite({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const bundle = await getEventBundle(slug);
  if (!bundle) notFound();

  const { event, guests, schedules, debutSeries } = bundle;
  const [allEvents, eventPosts] = await Promise.all([
    getPublishedEvents(),
    getPostsForEvent(event.id),
  ]);
  const others = allEvents.filter((e) => e.slug !== event.slug);

  const statusChip = {
    upcoming: { label: "Segera Hadir", cls: "border-ink text-ink", bg: event.accent },
    live: { label: "Sedang Berlangsung", cls: "border-ink text-paper", bg: "#FF4D00" },
    ended: { label: "Edisi Selesai — Arsip", cls: "border-paper/50 text-paper/70", bg: "transparent" },
  }[event.status];

  return (
    <div
      className="min-h-screen bg-ink"
      style={{ "--ev-accent": event.accent, "--ev-accent2": event.accent2 } as React.CSSProperties}
    >
      {/* ------------------------- microsite nav ------------------------- */}
      <header className="sticky top-0 z-50 border-b-3 border-paper bg-ink/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex size-9 items-center justify-center border-3 border-paper bg-ink text-paper shadow-[3px_3px_0_var(--ev-accent)] transition-transform hover:-translate-x-0.5"
              aria-label="Kembali ke hub"
            >
              <ArrowLeft className="size-4" strokeWidth={3} />
            </Link>
            <div className="leading-none">
              <p className="font-display text-sm text-paper">{event.name}</p>
              <p className="mt-0.5 font-mono text-[9px] tracking-[0.3em] uppercase" style={{ color: event.accent }}>
                Microsite Resmi {event.edition}
              </p>
            </div>
          </div>
          <nav className="hidden items-center gap-1 md:flex">
            {[
              ["#tentang", "Tentang"],
              ["#jadwal", "Jadwal"],
              ["#guest", "Guest Star"],
              ["#komik", "Komik"],
              ...(eventPosts.length > 0 ? [["#kabar", "Kabar"]] : []),
              ["#tiket", "Tiket"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="px-3.5 py-2 font-mono text-[11px] font-bold tracking-[0.18em] text-paper/70 uppercase transition-colors hover:text-[var(--ev-accent)]"
              >
                {label}
              </a>
            ))}
            {event.status === "upcoming" && (
              <a
                href="#tiket"
                className="ml-2 inline-flex items-center gap-2 border-3 border-ink px-4 py-2.5 font-mono text-[11px] font-bold tracking-widest text-ink uppercase shadow-[3px_3px_0_#f5f1e8] transition-all hover:-translate-y-0.5"
                style={{ backgroundColor: event.accent }}
              >
                <Ticket className="size-4" /> Beli Tiket
              </a>
            )}
          </nav>
          {event.status === "upcoming" && (
            <a
              href="#tiket"
              className="inline-flex items-center gap-1.5 border-2 border-ink px-3 py-2 font-mono text-[10px] font-bold tracking-widest text-ink uppercase md:hidden"
              style={{ backgroundColor: event.accent }}
            >
              <Ticket className="size-3.5" /> Tiket
            </a>
          )}
        </div>
      </header>

      {/* ----------------------------- hero ----------------------------- */}
      <section className="halftone-dark relative overflow-hidden border-b-3 border-paper">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-2.5"
          style={{ background: `linear-gradient(90deg, ${event.accent}, ${event.accent2}, ${event.accent})` }}
        />
        <div className="pointer-events-none absolute -top-8 -left-10 select-none font-display text-[20rem] leading-none opacity-[0.06] text-hollow">
          {event.edition.replace("VOL. ", "0").replace(" ", "")}
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pt-14 pb-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:pt-20 lg:pb-24">
          <div>
            <Reveal>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="border-3 px-3 py-1.5 font-mono text-[10px] font-bold tracking-[0.25em] uppercase"
                  style={{ backgroundColor: statusChip.bg, borderColor: event.status === "ended" ? "rgba(245,241,232,0.5)" : "#0a0a0e", color: event.status === "ended" ? "rgba(245,241,232,0.7)" : event.status === "live" ? "#f5f1e8" : "#0a0a0e" }}
                >
                  {statusChip.label}
                  {event.status === "live" && <span className="animate-blink">●</span>}
                </span>
                <span className="border-2 border-paper/40 px-3 py-1.5 font-mono text-[10px] font-bold tracking-[0.25em] text-paper/70 uppercase">
                  {event.edition} · {event.city}
                </span>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mt-6 font-display text-[13vw] leading-[0.84] uppercase sm:text-7xl lg:text-8xl">
                <span className="text-paper">Comic Week</span>
                <br />
                <span className="text-hollow-accent">{event.theme}</span>
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-paper/70 sm:text-lg">{event.tagline}</p>
            </Reveal>
            <Reveal delay={0.22}>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 border-2 border-paper/40 bg-ink px-3 py-2 font-mono text-[11px] font-bold tracking-widest text-paper uppercase">
                  <CalendarDays className="size-4" style={{ color: event.accent }} />
                  {dateRange(event.startDate, event.endDate)}
                </span>
                <span className="inline-flex items-center gap-2 border-2 border-paper/40 bg-ink px-3 py-2 font-mono text-[11px] font-bold tracking-widest text-paper uppercase">
                  <MapPin className="size-4" style={{ color: event.accent }} />
                  {event.venue}
                </span>
              </div>
            </Reveal>
            <Reveal delay={0.3}>
              {event.status === "upcoming" ? (
                <div className="mt-8">
                  <p className="mb-3 font-mono text-[10px] tracking-[0.3em] text-paper/50 uppercase">
                    Gerbang festival dibuka dalam
                  </p>
                  <Countdown target={event.startDate.toISOString()} />
                </div>
              ) : event.status === "ended" ? (
                <div className="mt-8 inline-flex rotate-[-2deg] flex-col border-3 border-dashed border-paper/40 px-5 py-3">
                  <span className="font-display text-lg text-paper/70 uppercase">Terima kasih sudah hadir!</span>
                  <span className="font-mono text-[10px] tracking-[0.25em] text-paper/45 uppercase">
                    Halaman ini kini menjadi arsip abadi {event.edition}
                  </span>
                </div>
              ) : (
                <div className="mt-8 inline-flex items-center gap-3 border-3 px-5 py-3" style={{ borderColor: event.accent }}>
                  <span className="size-3 animate-blink rounded-full bg-[#FF4D00]" />
                  <span className="font-display text-lg text-paper uppercase">Festival sedang berlangsung — datang sekarang!</span>
                </div>
              )}
            </Reveal>
          </div>

          {/* debut covers */}
          <div className="relative mx-auto h-96 w-full max-w-md lg:h-auto">
            {debutSeries.slice(0, 2).map((s, i) => (
              <Floaty
                key={s.id}
                delay={0.2 + i * 0.2}
                amount={10}
                duration={5.5 + i}
                className={i === 0 ? "absolute top-0 left-[6%] w-[54%] rotate-[-5deg]" : "absolute right-[4%] bottom-[2%] w-[54%] rotate-[4deg]"}
              >
                <Link href={`/comics/${s.slug}`} className="group block">
                  <div
                    className="aspect-[768/1376] w-full border-3 border-paper bg-cover bg-center transition-all duration-300 group-hover:scale-[1.03]"
                    style={{ backgroundImage: `url(${s.coverImage})`, boxShadow: `8px 8px 0 ${event.accent}` }}
                  />
                  <p className="mt-2 text-center font-marker text-lg" style={{ color: event.accent }}>
                    debut di {event.edition}!
                  </p>
                </Link>
              </Floaty>
            ))}
            {debutSeries.length === 0 && (
              <div className="flex h-full items-center justify-center border-3 border-dashed border-paper/25 p-8 text-center">
                <p className="font-mono text-xs tracking-[0.25em] text-paper/40 uppercase">
                  Lineup komik edisi ini diumumkan di panggung
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Marquee
        items={[event.theme, event.name, event.venue ?? "", dateRange(event.startDate, event.endDate), "MICROSITE RESMI"]}
        className="border-b-3 border-paper/20 bg-ink text-paper/60"
      />

      {/* ----------------------------- stats ----------------------------- */}
      {event.stats && (
        <section className="border-b-3 border-paper/15">
          <div className="mx-auto grid max-w-7xl grid-cols-2 divide-y-2 divide-paper/10 lg:grid-cols-4 lg:divide-x-2 lg:divide-y-0">
            {[
              { icon: Users, v: formatCompact(event.stats.visitors), l: event.status === "upcoming" ? "Target Pengunjung" : "Pengunjung" },
              { icon: Sparkles, v: `${event.stats.artists}`, l: "Kreator Tamu" },
              { icon: Ticket, v: `${event.stats.booths}`, l: "Booth & Artist Alley" },
              { icon: BookOpen, v: `${event.stats.series}`, l: "Judul Debut" },
            ].map((s, i) => (
              <div key={s.l} className="flex items-center gap-4 px-5 py-6 sm:px-8">
                <span className="flex size-11 shrink-0 items-center justify-center border-3 border-ink text-ink shadow-[3px_3px_0_#f5f1e8]" style={{ backgroundColor: i % 2 === 0 ? event.accent : event.accent2 }}>
                  <s.icon className="size-5" strokeWidth={2.5} />
                </span>
                <div>
                  <p className="font-display text-2xl text-paper sm:text-3xl">{s.v}</p>
                  <p className="font-mono text-[9px] tracking-[0.2em] text-paper/50 uppercase sm:text-[10px]">{s.l}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ----------------------------- tentang ----------------------------- */}
      <section id="tentang" className="scroll-mt-24">
        <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
          <Reveal>
            <p className="font-marker text-2xl" style={{ color: event.accent }}>
              tentang edisi ini
            </p>
            <h2 className="mt-1 font-display text-4xl text-paper uppercase sm:text-5xl">
              {event.theme} <span className="text-hollow">adalah</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 text-lg leading-relaxed text-paper/75">{event.description}</p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-8 border-3 p-5 sm:p-6" style={{ borderColor: event.accent }}>
              <p className="font-mono text-xs leading-relaxed tracking-wider uppercase" style={{ color: event.accent }}>
                {"//"} Semua informasi {event.name} — jadwal, guest star, tiket, dan komik debut — hanya
                dipublikasikan di microsite ini. Simpan tautannya.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ----------------------------- jadwal ----------------------------- */}
      {schedules.length > 0 && (
        <section id="jadwal" className="scroll-mt-24 border-t-3 border-paper/15">
          <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="font-marker text-2xl" style={{ color: event.accent }}>
                    catat jamnya
                  </p>
                  <h2 className="font-display text-4xl text-paper uppercase sm:text-5xl">Rundown Festival</h2>
                </div>
                <span className="font-mono text-[10px] tracking-[0.25em] text-paper/45 uppercase">
                  {schedules.length} agenda · semua dalam WIB
                </span>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="mt-10">
                <ScheduleTabs
                  items={schedules.map((s) => ({
                    id: s.id,
                    day: s.day,
                    dateLabel: s.dateLabel,
                    time: s.time,
                    title: s.title,
                    stage: s.stage,
                    kind: s.kind,
                  }))}
                  accent={event.accent}
                />
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ----------------------------- guest star ----------------------------- */}
      {guests.length > 0 && (
        <section id="guest" className="halftone-dark scroll-mt-24 border-y-3 border-paper bg-ink-soft">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="font-marker text-2xl" style={{ color: event.accent }}>
                    yang akan kamu temui
                  </p>
                  <h2 className="font-display text-4xl text-paper uppercase sm:text-5xl">Guest Star</h2>
                </div>
                <span className="font-mono text-[10px] tracking-[0.25em] text-paper/45 uppercase">
                  {guests.length} kreator · lokal & internasional
                </span>
              </div>
            </Reveal>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {guests.map((g, i) => (
                <Reveal key={g.id} delay={(i % 3) * 0.08}>
                  <div className="group relative h-full border-3 border-paper bg-ink p-5 transition-all hover:-translate-y-1.5" style={{ boxShadow: `0 0 0 0 ${event.accent}` }}>
                    <div className="flex items-start gap-4">
                      <span
                        className="flex size-14 shrink-0 items-center justify-center border-3 border-ink font-display text-lg text-ink shadow-[3px_3px_0_#f5f1e8]"
                        style={{ background: `linear-gradient(135deg, ${g.color}, ${event.accent})` }}
                      >
                        {initials(g.name)}
                      </span>
                      <div>
                        <h3 className="font-display text-lg leading-tight text-paper uppercase">{g.name}</h3>
                        <p className="mt-1 font-mono text-[10px] font-bold tracking-widest uppercase" style={{ color: event.accent }}>
                          {g.role}
                        </p>
                        <p className="mt-0.5 font-mono text-[9px] tracking-[0.2em] text-paper/40 uppercase">{g.origin}</p>
                      </div>
                    </div>
                    {g.bio && <p className="mt-4 text-sm leading-relaxed text-paper/60">{g.bio}</p>}
                    <span className="absolute top-3 right-3 font-marker text-lg text-paper/25 transition-colors group-hover:text-[var(--ev-accent)]">
                      ★
                    </span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ----------------------------- komik debut ----------------------------- */}
      {debutSeries.length > 0 && (
        <section id="komik" className="scroll-mt-24">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="font-marker text-2xl" style={{ color: event.accent }}>
                    lahir di panggung {event.edition}
                  </p>
                  <h2 className="font-display text-4xl text-paper uppercase sm:text-5xl">Komik Debut Edisi Ini</h2>
                </div>
                <Link
                  href="/comics"
                  className="group inline-flex items-center gap-2 border-b-3 pb-1 font-mono text-xs font-bold tracking-[0.2em] uppercase"
                  style={{ color: event.accent, borderColor: event.accent }}
                >
                  Semua judul
                  <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </Link>
              </div>
            </Reveal>
            <div className="no-scrollbar mt-10 flex gap-6 overflow-x-auto pb-4 lg:grid lg:grid-cols-4 lg:overflow-visible">
              {debutSeries.map((s, i) => (
                <Reveal key={s.id} delay={i * 0.08} className="w-56 shrink-0 lg:w-auto">
                  <Link href={`/comics/${s.slug}`} className="group block">
                    <div className="relative overflow-hidden border-3 border-paper transition-all group-hover:-translate-y-1.5" style={{ boxShadow: `6px 6px 0 ${event.accent}` }}>
                      <div className="aspect-[768/1376] w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: `url(${getSeriesCover(s.coverImage, s.slug)})` }} />
                      <div className="absolute right-2 bottom-2 left-2 flex items-end justify-between">
                        <span className="border-2 border-ink bg-paper px-2 py-0.5 font-mono text-[9px] font-bold tracking-widest text-ink uppercase shadow-[2px_2px_0_#000]">
                          {s.genres[0]}
                        </span>
                        <span className="flex items-center gap-1 border-2 border-ink bg-ink px-1.5 py-0.5 font-mono text-[10px] font-bold" style={{ color: event.accent }}>
                          <Star className="size-3 fill-current" /> {s.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <h3 className="mt-3 font-display text-lg text-paper uppercase transition-colors" style={{ textDecorationColor: event.accent }}>
                      {s.title}
                    </h3>
                    <p className="font-mono text-[10px] tracking-widest text-paper/50 uppercase">{s.author}</p>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ----------------------------- kabar & kegiatan ----------------------------- */}
      {eventPosts.length > 0 && (
        <section id="kabar" className="scroll-mt-24 border-t-3 border-paper/15 bg-ink">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
            <Reveal>
              <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
                <div>
                  <p className="font-mono text-xs font-bold tracking-[0.3em] uppercase" style={{ color: event.accent }}>
                    Warta & Update Resmi
                  </p>
                  <h2 className="font-display text-4xl text-paper uppercase sm:text-5xl">
                    Kabar Kegiatan {event.edition}
                  </h2>
                </div>
                <Link
                  href={`/blog?edition=${encodeURIComponent(event.edition)}`}
                  className="group inline-flex items-center gap-2 border-b-3 pb-1 font-mono text-xs font-bold tracking-[0.2em] uppercase"
                  style={{ color: event.accent, borderColor: event.accent }}
                >
                  Semua Arsip Kabar {event.edition}
                  <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </Link>
              </div>
            </Reveal>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {eventPosts.map((post, i) => (
                <Reveal key={post.id} delay={i * 0.08} className="h-full">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group flex h-full flex-col border-3 border-paper/80 bg-ink-soft transition-all hover:-translate-y-1.5 hover:border-[var(--ev-accent)]"
                    style={{ boxShadow: `6px 6px 0 ${event.accent}` }}
                  >
                    {post.coverImage && (
                      <div className="relative aspect-[16/9] w-full overflow-hidden border-b-3 border-paper/80 bg-ink">
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <span
                          className="absolute top-3 left-3 border-2 border-ink px-2 py-0.5 font-mono text-[9px] font-bold tracking-widest text-ink uppercase shadow-[2px_2px_0_#000]"
                          style={{ backgroundColor: event.accent }}
                        >
                          {post.category}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-6">
                      <div className="mb-2 flex items-center justify-between font-mono text-[10px] tracking-wider text-paper/40 uppercase">
                        <span>
                          {new Date(post.publishedAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span>Oleh {post.author}</span>
                      </div>
                      <h3 className="font-display text-xl text-paper uppercase transition-colors group-hover:text-[var(--ev-accent)]">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-paper/70">
                          {post.excerpt}
                        </p>
                      )}
                      <div
                        className="mt-auto flex items-center gap-1.5 pt-6 font-mono text-[11px] font-bold uppercase"
                        style={{ color: event.accent }}
                      >
                        Baca Selengkapnya
                        <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ----------------------------- tiket ----------------------------- */}
      {event.tickets && event.tickets.length > 0 && (
        <section id="tiket" className="scroll-mt-24 border-t-3 border-paper/15 bg-ink-soft">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
            <Reveal>
              <div className="text-center">
                <p className="font-marker text-2xl" style={{ color: event.accent }}>
                  {event.status === "ended" ? "kenang-kenangan harga" : "pilih senjatamu"}
                </p>
                <h2 className="font-display text-4xl text-paper uppercase sm:text-5xl">
                  {event.status === "ended" ? "Tiket Edisi Ini (Arsip)" : "Tiket Masuk"}
                </h2>
                {event.status === "upcoming" && (
                  <p className="mx-auto mt-3 max-w-md text-sm text-paper/55">
                    Pembayaran di halaman ini adalah simulasi demo — kursi sungguhan diamankan lewat
                    gerbang resmi di venue.
                  </p>
                )}
              </div>
            </Reveal>
            <div className={`mt-12 grid gap-6 sm:grid-cols-2 ${event.tickets.length >= 3 ? "lg:grid-cols-3" : "lg:mx-auto lg:max-w-3xl"}`}>
              {event.tickets.map((t, i) => (
                <Reveal key={t.name} delay={i * 0.1} className="h-full">
                  <div
                    className={`relative flex h-full flex-col border-3 p-6 sm:p-7 ${
                      t.highlight ? "border-ink bg-paper text-ink" : "border-paper bg-ink text-paper"
                    }`}
                    style={t.highlight ? { boxShadow: `8px 8px 0 ${event.accent}` } : undefined}
                  >
                    {t.label && (
                      <span
                        className="absolute -top-3.5 left-5 border-3 border-ink px-2.5 py-1 font-mono text-[9px] font-bold tracking-[0.2em] text-ink uppercase shadow-[2px_2px_0_#000]"
                        style={{ backgroundColor: event.accent }}
                      >
                        {t.label}
                      </span>
                    )}
                    <h3 className="mt-2 font-display text-2xl uppercase">{t.name}</h3>
                    <p className="mt-2 font-display text-4xl" style={t.highlight ? undefined : { color: event.accent }}>
                      {formatIDR(t.price)}
                    </p>
                    <ul className="mt-5 mb-6 flex flex-col gap-2.5">
                      {t.perks.map((p) => (
                        <li key={p} className="flex items-start gap-2 text-sm">
                          <span className="mt-0.5 flex size-4.5 shrink-0 items-center justify-center border-2 border-ink text-[10px] font-black text-ink" style={{ backgroundColor: event.accent }}>
                            ✓
                          </span>
                          <span className={t.highlight ? "text-ink/75" : "text-paper/70"}>{p}</span>
                        </li>
                      ))}
                    </ul>
                    {event.status === "upcoming" ? (
                      <TicketBuyButton tierName={t.name} />
                    ) : (
                      <span className="mt-auto border-2 border-dashed border-paper/30 px-4 py-3 text-center font-mono text-[10px] tracking-[0.2em] text-paper/40 uppercase">
                        Penjualan ditutup
                      </span>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ----------------------------- footer microsite ----------------------------- */}
      <footer className="border-t-3 border-paper bg-ink">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div>
              <p className="font-display text-2xl text-paper uppercase">
                {event.name} <span style={{ color: event.accent }}>· {event.theme}</span>
              </p>
              <p className="mt-2 max-w-md font-mono text-[11px] leading-relaxed tracking-wider text-paper/45 uppercase">
                Ini adalah microsite resmi {event.edition}. Seluruh informasi edisi ini hidup dan
                diabadikan hanya di halaman ini.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {others.map((o) => (
                <Link
                  key={o.id}
                  href={`/events/${o.slug}`}
                  className="group inline-flex items-center gap-2 border-2 border-paper/30 px-4 py-2.5 font-mono text-[11px] font-bold tracking-widest text-paper/70 uppercase transition-colors hover:border-[var(--ev-accent)] hover:text-[var(--ev-accent)]"
                >
                  {o.name} — {o.theme}
                  <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              ))}
              <Link
                href="/"
                className="group inline-flex items-center gap-2 border-3 border-ink bg-paper px-4 py-2.5 font-mono text-[11px] font-bold tracking-widest text-ink uppercase shadow-[3px_3px_0_var(--ev-accent)]"
              >
                <ArrowLeft className="size-4" />
                Kembali ke Hub Comic Week
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
