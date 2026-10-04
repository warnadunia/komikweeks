import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, Droplet, Star } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReadProgress } from "@/components/read-progress";
import { UnlockGate } from "@/components/unlock-gate";
import { WalletBadge } from "@/components/wallet-client";
import { getChapter, getWallet, hasPurchased } from "@/lib/queries";
import { getVisitorKey } from "@/lib/visitor";
import { getChapterSlices } from "@/lib/dummy-images";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; num: string }>;
}): Promise<Metadata> {
  const { slug, num } = await params;
  const data = await getChapter(slug, Number(num));
  if (!data) return { title: "Chapter tidak ditemukan" };
  return { title: `${data.series.title} — Chapter ${data.chapter.number}: ${data.chapter.title}` };
}

export default async function ReaderPage({
  params,
}: {
  params: Promise<{ slug: string; num: string }>;
}) {
  const { slug, num } = await params;
  const chapterNum = Number(num);
  if (!Number.isFinite(chapterNum)) notFound();

  const data = await getChapter(slug, chapterNum);
  if (!data) notFound();
  const { series, chapter, publishedNumbers } = data;

  const visitorKey = await getVisitorKey();
  const wallet = visitorKey ? await getWallet(visitorKey) : null;
  const owned = visitorKey ? await hasPurchased(visitorKey, chapter.id) : false;
  const canRead = chapter.isFree || owned;

  const prevNum = publishedNumbers.filter((n) => n < chapter.number).pop() ?? null;
  const nextNum = publishedNumbers.find((n) => n > chapter.number) ?? null;

  return (
    <div className="min-h-screen bg-[#050507]">
      <ReadProgress />

      {/* reader chrome */}
      <header className="sticky top-0 z-50 border-b-2 border-paper/15 bg-ink/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-3 px-4">
          <Link
            href={`/comics/${series.slug}`}
            className="inline-flex items-center gap-2 font-mono text-[11px] font-bold tracking-widest text-paper/70 uppercase transition-colors hover:text-acid"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">{series.title}</span>
            <span className="sm:hidden">Kembali</span>
          </Link>
          <p className="truncate text-center font-display text-xs tracking-wide text-paper uppercase sm:text-sm">
            Ch. {chapter.number} — {chapter.title}
          </p>
          <div className="flex items-center gap-2">
            {wallet && wallet.coins > 0 && <WalletBadge coins={wallet.coins} />}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[720px] px-0 sm:px-4">
        {canRead ? (
          <>
            <div className="flex items-center gap-3 px-4 py-6 sm:px-0">
              <span className="flex size-10 items-center justify-center border-2 border-ink bg-acid font-display text-sm text-ink shadow-[2px_2px_0_#f5f1e8]">
                {String(chapter.number).padStart(2, "0")}
              </span>
              <div>
                <h1 className="font-display text-lg leading-tight text-paper uppercase sm:text-xl">{chapter.title}</h1>
                <p className="font-mono text-[10px] tracking-widest text-paper/45 uppercase">
                  {series.title} · {series.author}
                </p>
              </div>
              {owned && !chapter.isFree && (
                <span className="ml-auto inline-flex items-center gap-1 border border-acid/60 px-2 py-1 font-mono text-[9px] font-bold tracking-widest text-acid uppercase">
                  <Check className="size-3" /> Milikmu
                </span>
              )}
            </div>

            {/* vertical slices */}
            {(() => {
              const pages = getChapterSlices(chapter.pages, series.slug);
              const isDummy = !chapter.pages || chapter.pages.length === 0;

              return (
                <>
                  {isDummy && (
                    <div className="mx-4 mb-4 flex items-center justify-between border-2 border-dashed border-acid/60 bg-acid/10 px-4 py-2 font-mono text-xs text-acid sm:mx-0">
                      <span>// DRAFT PREVIEW — Panel Visual Dummy Comic Week</span>
                      <span className="text-[10px] tracking-widest uppercase">Showcase</span>
                    </div>
                  )}
                  <div className="flex flex-col">
                    {pages.map((p, i) => (
                      <div
                        key={i}
                        className="slice w-full"
                        style={{
                          aspectRatio: p.ar,
                          backgroundImage: `url(${p.src})`,
                          backgroundPosition: `50% ${p.pos}%`,
                        }}
                      />
                    ))}
                  </div>
                </>
              );
            })()}

            {/* end panel */}
            <div className="border-t-3 border-dashed border-paper/20 px-4 py-12 text-center sm:px-0">
              <p className="font-marker text-2xl text-acid">bersambung...</p>
              <p className="mt-1 font-mono text-[10px] tracking-[0.25em] text-paper/40 uppercase">
                Chapter {chapter.number} selesai — terima kasih sudah membaca
              </p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                {prevNum && (
                  <Link
                    href={`/comics/${series.slug}/chapter/${prevNum}`}
                    className="inline-flex items-center gap-2 border-2 border-paper/40 px-5 py-3 font-mono text-xs font-bold tracking-widest text-paper/70 uppercase transition-colors hover:border-paper hover:text-paper"
                  >
                    <ChevronLeft className="size-4" /> Ch. {prevNum}
                  </Link>
                )}
                <Link
                  href={`/comics/${series.slug}`}
                  className="inline-flex items-center gap-2 border-2 border-paper/40 px-5 py-3 font-mono text-xs font-bold tracking-widest text-paper/70 uppercase transition-colors hover:border-paper hover:text-paper"
                >
                  Daftar Chapter
                </Link>
                {nextNum && (
                  <Link
                    href={`/comics/${series.slug}/chapter/${nextNum}`}
                    className="inline-flex items-center gap-2 border-3 border-ink bg-acid px-5 py-3 font-display text-sm tracking-wide text-ink uppercase shadow-[4px_4px_0_#f5f1e8] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#f5f1e8]"
                  >
                    Lanjut Ch. {nextNum} <ChevronRight className="size-4" />
                  </Link>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="px-4 py-8 sm:px-0">
            <UnlockGate
              chapterId={chapter.id}
              priceCoins={chapter.priceCoins}
              chapterTitle={`Chapter ${chapter.number} — ${chapter.title}`}
              seriesSlug={series.slug}
              balance={wallet?.coins ?? 0}
              welcomeClaimed={wallet?.welcomeClaimed ?? false}
              preview={chapter.pages[0] ?? null}
            />
          </div>
        )}
      </main>

      {/* bottom nav */}
      {canRead && (
        <footer className="sticky bottom-0 z-40 border-t-2 border-paper/15 bg-ink/90 backdrop-blur">
          <div className="mx-auto flex h-13 max-w-3xl items-center justify-between px-4">
            {prevNum ? (
              <Link href={`/comics/${series.slug}/chapter/${prevNum}`} className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-widest text-paper/70 uppercase hover:text-acid">
                <ArrowLeft className="size-4" /> Ch. {prevNum}
              </Link>
            ) : (
              <span className="font-mono text-[11px] tracking-widest text-paper/30 uppercase">Awal seri</span>
            )}
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-paper/35 uppercase">
              <Star className="size-3 fill-acid text-acid" /> {series.rating.toFixed(1)} · {series.title}
            </span>
            {nextNum ? (
              <Link href={`/comics/${series.slug}/chapter/${nextNum}`} className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-widest text-paper/70 uppercase hover:text-acid">
                Ch. {nextNum} <ArrowRight className="size-4" />
              </Link>
            ) : (
              <span className="font-mono text-[11px] tracking-widest text-paper/30 uppercase">Chapter terbaru</span>
            )}
          </div>
        </footer>
      )}
    </div>
  );
}
