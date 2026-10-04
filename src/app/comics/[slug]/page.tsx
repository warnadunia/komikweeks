import type { Metadata } from "next";
import { ArrowLeft, ArrowUpRight, CalendarDays, Droplet, Eye, Heart, Lock, Play, Star } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Marquee } from "@/components/marquee";
import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { getChaptersForSeries, getOwnedChapterIds, getSeriesBySlug } from "@/lib/queries";
import { getVisitorKey } from "@/lib/visitor";
import { formatCompact, formatDate } from "@/lib/utils";
import { getSeriesCover } from "@/lib/dummy-images";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getSeriesBySlug(slug);
  if (!data) return { title: "Komik tidak ditemukan" };
  return {
    title: data.series.title,
    description: data.series.synopsis.slice(0, 150),
  };
}

export default async function SeriesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getSeriesBySlug(slug);
  if (!data) notFound();

  const s = data.series;
  const chapterRows = await getChaptersForSeries(s.id);
  const visitorKey = await getVisitorKey();
  const owned = visitorKey
    ? await getOwnedChapterIds(visitorKey, chapterRows.map((c) => c.id))
    : new Set<number>();

  const firstChapter = chapterRows.find((c) => c.isPublished);

  const coverUrl = getSeriesCover(s.coverImage, s.slug);

  return (
    <div>
      <SiteNav />

      {/* banner */}
      <header className="relative overflow-hidden border-b-3 border-paper">
        <div
          className="absolute inset-0 scale-125 bg-cover bg-center opacity-25 blur-2xl saturate-75"
          style={{ backgroundImage: `url(${coverUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/80 to-ink" />
        <div className="halftone-dark absolute inset-0" />

        <div className="relative mx-auto max-w-7xl px-4 pt-10 pb-14 sm:px-6 lg:pb-20">
          <Link
            href="/comics"
            className="inline-flex items-center gap-2 font-mono text-xs font-bold tracking-widest text-paper/60 uppercase transition-colors hover:text-acid"
          >
            <ArrowLeft className="size-4" /> Biblioteka
          </Link>

          <div className="mt-8 grid gap-10 lg:grid-cols-[340px_1fr] lg:gap-14">
            <Reveal>
              <div className="relative mx-auto w-64 rotate-[-2deg] sm:w-72 lg:w-full">
                <div
                  className="aspect-[768/1376] w-full border-3 border-paper bg-cover bg-center shadow-[10px_10px_0_#c9f73a]"
                  style={{ backgroundImage: `url(${coverUrl})` }}
                />
                {s.status === "upcoming" && (
                  <span className="absolute -right-3 top-6 rotate-6 border-3 border-ink bg-brand px-3 py-1.5 font-mono text-[10px] font-bold tracking-widest text-paper uppercase shadow-[3px_3px_0_#000]">
                    Segera Hadir
                  </span>
                )}
              </div>
            </Reveal>

            <div className="flex flex-col justify-center">
              <Reveal delay={0.05}>
                <div className="flex flex-wrap gap-2">
                  {s.genres.map((g) => (
                    <span key={g} className="border-2 border-acid/70 bg-ink px-2.5 py-1 font-mono text-[10px] font-bold tracking-widest text-acid uppercase">
                      {g}
                    </span>
                  ))}
                  {data.debutName && (
                    <Link
                      href={`/events/${data.debutSlug}`}
                      className="group inline-flex items-center gap-1.5 border-2 border-paper/40 bg-ink px-2.5 py-1 font-mono text-[10px] font-bold tracking-widest text-paper/80 uppercase transition-colors hover:border-acid hover:text-acid"
                    >
                      Debut di {data.debutName}
                      <ArrowUpRight className="size-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                  )}
                </div>
              </Reveal>
              <Reveal delay={0.1}>
                <h1 className="mt-5 font-display text-5xl leading-[0.85] text-paper uppercase sm:text-7xl">
                  {s.title}
                </h1>
                <p className="mt-3 font-marker text-xl text-acid sm:text-2xl">oleh {s.author}</p>
              </Reveal>
              <Reveal delay={0.15}>
                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs font-bold tracking-widest text-paper/70 uppercase">
                  <span className="inline-flex items-center gap-1.5 text-acid">
                    <Star className="size-4 fill-acid text-acid" /> {s.rating.toFixed(1)} / 10
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Eye className="size-4" /> {formatCompact(s.views)} dibaca
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Heart className="size-4 fill-paper/80 text-paper/80" /> {formatCompact(s.likes)} suka
                  </span>
                  {s.releaseDay && (
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="size-4" /> Update tiap {s.releaseDay}
                    </span>
                  )}
                </div>
              </Reveal>
              <Reveal delay={0.2}>
                <p className="mt-6 max-w-2xl text-base leading-relaxed text-paper/75">{s.synopsis}</p>
              </Reveal>
              <Reveal delay={0.25}>
                {firstChapter ? (
                  <Link
                    href={`/comics/${s.slug}/chapter/${firstChapter.number}`}
                    className="group mt-8 inline-flex w-fit items-center gap-3 border-3 border-ink bg-acid px-7 py-4 font-display text-sm tracking-wide text-ink uppercase shadow-[6px_6px_0_#f5f1e8] transition-all hover:-translate-y-1 hover:shadow-[9px_9px_0_#f5f1e8]"
                  >
                    <Play className="size-4 fill-ink" />
                    Mulai Baca — Chapter {firstChapter.number}
                  </Link>
                ) : (
                  <div className="mt-8 inline-flex w-fit flex-col gap-2 border-3 border-dashed border-paper/40 bg-ink px-6 py-4">
                    <p className="font-display text-lg text-paper uppercase">Chapter perdana dimasak di dapur kreator</p>
                    <p className="font-mono text-xs tracking-widest text-paper/50 uppercase">
                      Rilis perdana di panggung {data.debutName ?? "Comic Week"} — pantau terus.
                    </p>
                  </div>
                )}
              </Reveal>
            </div>
          </div>
        </div>
      </header>

      <Marquee
        items={[`${s.title.toUpperCase()}`, s.author.toUpperCase(), ...s.genres.map((g) => g.toUpperCase())]}
        className="border-b-3 border-paper/15 bg-ink text-paper/40"
      />

      {/* chapter list */}
      <main className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        <Reveal>
          <h2 className="font-display text-3xl text-paper uppercase sm:text-4xl">
            Daftar Chapter
            <span className="ml-3 align-middle font-mono text-xs font-bold tracking-[0.25em] text-paper/45">
              {chapterRows.filter((c) => c.isPublished).length} TERBIT
            </span>
          </h2>
        </Reveal>

        <div className="mt-8 flex flex-col gap-3">
          {chapterRows.map((c, i) => {
            const isOwned = c.isFree || owned.has(c.id);
            if (!c.isPublished) {
              return (
                <Reveal key={c.id} delay={i * 0.05}>
                  <div className="flex items-center gap-4 border-3 border-dashed border-paper/25 bg-ink-soft/60 px-5 py-4 opacity-70">
                    <span className="flex size-11 shrink-0 items-center justify-center border-2 border-paper/25 font-display text-sm text-paper/40">
                      {String(c.number).padStart(2, "0")}
                    </span>
                    <div className="flex-1">
                      <p className="font-display text-base text-paper/45 uppercase">{c.title}</p>
                      <p className="font-mono text-[10px] tracking-widest text-paper/35 uppercase">
                        Terbit {formatDate(c.publishedAt)}
                      </p>
                    </div>
                    <span className="border-2 border-paper/25 px-2 py-1 font-mono text-[9px] font-bold tracking-widest text-paper/40 uppercase">
                      Segera
                    </span>
                  </div>
                </Reveal>
              );
            }
            return (
              <Reveal key={c.id} delay={i * 0.05}>
                <Link
                  href={`/comics/${s.slug}/chapter/${c.number}`}
                  className="group flex items-center gap-4 border-3 border-paper/20 bg-ink-soft px-5 py-4 transition-all hover:-translate-y-0.5 hover:border-acid hover:shadow-[6px_6px_0_#c9f73a]"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center border-2 border-paper bg-paper font-display text-sm text-ink shadow-[2px_2px_0_#000] transition-colors group-hover:bg-acid">
                    {String(c.number).padStart(2, "0")}
                  </span>
                  <div className="flex-1">
                    <p className="font-display text-base text-paper uppercase transition-colors group-hover:text-acid">
                      {c.title}
                    </p>
                    <p className="font-mono text-[10px] tracking-widest text-paper/40 uppercase">
                      {formatDate(c.publishedAt)}
                    </p>
                  </div>
                  {c.isFree ? (
                    <span className="border-2 border-ink bg-acid px-2 py-1 font-mono text-[9px] font-bold tracking-widest text-ink uppercase shadow-[2px_2px_0_#000]">
                      Gratis
                    </span>
                  ) : isOwned ? (
                    <span className="border-2 border-paper/60 px-2 py-1 font-mono text-[9px] font-bold tracking-widest text-paper/70 uppercase">
                      Milikmu
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 border-2 border-ink bg-paper px-2 py-1 font-mono text-[9px] font-bold tracking-widest text-ink uppercase shadow-[2px_2px_0_#000]">
                      <Lock className="size-3" />
                      <Droplet className="size-3 fill-ink" />
                      {c.priceCoins}
                    </span>
                  )}
                </Link>
              </Reveal>
            );
          })}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
