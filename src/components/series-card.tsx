import { BookLock, Lock, Star } from "lucide-react";
import Link from "next/link";
import type { SeriesCardData } from "@/lib/queries";
import { formatCompact } from "@/lib/utils";
import { getSeriesCover } from "@/lib/dummy-images";

export function SeriesCard({ s, rank }: { s: SeriesCardData; rank?: number }) {
  const coverUrl = getSeriesCover(s.coverImage, s.slug);

  return (
    <Link
      href={`/comics/${s.slug}`}
      className="group relative flex flex-col border-3 border-paper/0 transition-transform duration-300 hover:-translate-y-2 hover:rotate-[-0.5deg]"
    >
      <div className="relative overflow-hidden border-3 border-paper shadow-[6px_6px_0_rgba(245,241,232,0.9)] transition-shadow duration-300 group-hover:shadow-[10px_10px_0_var(--color-acid)]">
        <div
          className="aspect-[768/1376] w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.05]"
          style={{ backgroundImage: `url(${coverUrl})` }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/85 via-transparent to-ink/20" />
        {rank !== undefined && (
          <span className="absolute top-2 left-2 flex size-9 items-center justify-center border-3 border-ink bg-acid font-display text-base text-ink shadow-[2px_2px_0_#000]">
            {rank}
          </span>
        )}
        {s.status === "upcoming" && (
          <span className="absolute top-2 right-2 rotate-3 border-2 border-ink bg-brand px-2 py-1 font-mono text-[9px] font-bold tracking-widest text-paper uppercase shadow-[2px_2px_0_#000]">
            Segera Hadir
          </span>
        )}
        <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
          {s.genres.slice(0, 2).map((g) => (
            <span key={g} className="border border-paper/60 bg-ink/70 px-1.5 py-0.5 font-mono text-[9px] tracking-widest text-paper/90 uppercase backdrop-blur-sm">
              {g}
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-start justify-between gap-2 pt-3">
        <div>
          <h3 className="font-display text-base leading-tight text-paper uppercase transition-colors group-hover:text-acid sm:text-lg">
            {s.title}
          </h3>
          <p className="mt-0.5 font-mono text-[10px] tracking-widest text-paper/50 uppercase">
            {s.author}
          </p>
        </div>
        <span className="flex shrink-0 items-center gap-1 border-2 border-paper/30 bg-ink-soft px-1.5 py-1 font-mono text-[11px] font-bold text-acid">
          <Star className="size-3 fill-acid text-acid" />
          {s.rating.toFixed(1)}
        </span>
      </div>
      <div className="mt-1.5 flex items-center gap-3 font-mono text-[10px] tracking-wider text-paper/45 uppercase">
        <span>{formatCompact(s.views)} dibaca</span>
        {s.chapterCount > 0 ? (
          <span>{s.chapterCount} chapter</span>
        ) : (
          <span className="inline-flex items-center gap-1 text-brand">
            <BookLock className="size-3" /> Debut di event
          </span>
        )}
      </div>
    </Link>
  );
}
