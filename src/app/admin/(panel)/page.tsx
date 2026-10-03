import { sql } from "drizzle-orm";
import { desc, eq } from "drizzle-orm";
import {
  ArrowRight,
  BookOpen,
  CalendarRange,
  Droplet,
  EyeOff,
  FileWarning,
  ReceiptText,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { SectionCard } from "@/components/admin/fields";
import { db } from "@/db";
import { chapters, events, guests, purchases, schedules, series, wallets } from "@/db/schema";
import { formatDate, formatDateLong } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [
    eventRows,
    seriesRows,
    chapterRows,
    [statPurchases],
    [statCoins],
    [statWallets],
    recent,
  ] = await Promise.all([
    db.select().from(events),
    db.select().from(series),
    db.select().from(chapters),
    db.select({ n: sql<number>`count(*)::int` }).from(purchases),
    db.select({ n: sql<number>`coalesce(sum(${purchases.coinsSpent}),0)::int` }).from(purchases),
    db.select({ n: sql<number>`count(*)::int` }).from(wallets),
    db
      .select({
        id: purchases.id,
        visitor: purchases.visitorKey,
        coins: purchases.coinsSpent,
        at: purchases.createdAt,
        chapterTitle: chapters.title,
        chapterNumber: chapters.number,
        seriesTitle: series.title,
        seriesSlug: series.slug,
      })
      .from(purchases)
      .innerJoin(chapters, eq(purchases.chapterId, chapters.id))
      .innerJoin(series, eq(chapters.seriesId, series.id))
      .orderBy(desc(purchases.createdAt))
      .limit(8),
  ]);

  const publishedChapters = chapterRows.filter((c) => c.isPublished).length;
  const publishedEvents = eventRows.filter((e) => e.isPublished).length;

  // checklist konten
  const eventIdsWithSchedules = new Set((await db.select({ id: schedules.eventId }).from(schedules)).map((r) => r.id));
  const eventIdsWithGuests = new Set((await db.select({ id: guests.eventId }).from(guests)).map((r) => r.id));
  const chaptersBySeries = new Map<number, number>();
  chapterRows.forEach((c) => {
    if (c.isPublished) chaptersBySeries.set(c.seriesId, (chaptersBySeries.get(c.seriesId) ?? 0) + 1);
  });
  const issues: { label: string; href: string; level: "warn" | "info" }[] = [];
  eventRows.forEach((e) => {
    if (!e.isPublished) issues.push({ label: `Microsite "${e.name}" belum dipublikasikan`, href: `/admin/events/${e.id}`, level: "info" });
    if (e.isPublished && !eventIdsWithSchedules.has(e.id)) issues.push({ label: `"${e.name}" belum punya jadwal`, href: `/admin/events/${e.id}`, level: "warn" });
    if (e.isPublished && !eventIdsWithGuests.has(e.id)) issues.push({ label: `"${e.name}" belum punya guest star`, href: `/admin/events/${e.id}`, level: "warn" });
  });
  seriesRows.forEach((s) => {
    if (!(chaptersBySeries.get(s.id) ?? 0) && s.status !== "upcoming")
      issues.push({ label: `Seri "${s.title}" tidak punya chapter terbit`, href: `/admin/series/${s.id}`, level: "warn" });
  });
  chapterRows.filter((c) => !c.isPublished).forEach((c) => {
    const s = seriesRows.find((x) => x.id === c.seriesId);
    issues.push({ label: `"${s?.title ?? "?"} Ch.${c.number}" masih berstatus draft`, href: `/admin/series/${c.seriesId}`, level: "info" });
  });

  const cards = [
    { icon: CalendarRange, label: "Microsite Event", value: `${publishedEvents}/${eventRows.length}`, sub: "publik / total", href: "/admin/events", color: "#C9F73A" },
    { icon: BookOpen, label: "Seri Komik", value: `${seriesRows.length}`, sub: `${publishedChapters} chapter terbit`, href: "/admin/series", color: "#8B5CF6" },
    { icon: ReceiptText, label: "Chapter Ter-unlock", value: `${statPurchases.n}`, sub: "total pembelian", href: "/admin/purchases", color: "#FF4D00" },
    { icon: Wallet, label: "Dompet Pembaca", value: `${statWallets.n}`, sub: "pengunjung unik", href: "/admin/purchases", color: "#35E0FF" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="font-mono text-[10px] font-bold tracking-[0.3em] text-acid uppercase">Dashboard</p>
        <h1 className="mt-2 font-display text-3xl text-paper uppercase sm:text-4xl">Meja Redaksi</h1>
        <p className="mt-2 max-w-xl text-sm text-paper/55">
          Kelola microsite tiap edisi, katalog komik, chapter berbayar, dan pantau transaksi Koin
          Tinta dari satu tempat.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="group border-3 border-paper/20 bg-ink-soft p-4 transition-all hover:-translate-y-1 hover:border-paper"
            style={{ boxShadow: `0 0 0 0 ${c.color}` }}
          >
            <span
              className="flex size-10 items-center justify-center border-3 border-ink text-ink shadow-[2px_2px_0_#f5f1e8]"
              style={{ backgroundColor: c.color }}
            >
              <c.icon className="size-5" strokeWidth={2.5} />
            </span>
            <p className="mt-3 font-display text-2xl text-paper">{c.value}</p>
            <p className="font-mono text-[9px] tracking-[0.18em] text-paper/50 uppercase">{c.label}</p>
            <p className="mt-0.5 font-mono text-[9px] text-paper/35">{c.sub}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Transaksi Terbaru" desc="unlock chapter oleh pembaca" accent="#FF4D00"
          actions={
            <Link href="/admin/purchases" className="group inline-flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-widest text-acid uppercase">
              Semua <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          }>
          {recent.length === 0 ? (
            <p className="font-mono text-xs text-paper/40">Belum ada transaksi. Bagikan link chapter berbayar untuk mulai menguji.</p>
          ) : (
            <ul className="flex flex-col divide-y-2 divide-paper/10">
              {recent.map((r) => (
                <li key={r.id} className="flex items-center gap-3 py-2.5">
                  <span className="flex size-8 shrink-0 items-center justify-center border-2 border-paper/30 font-mono text-[9px] text-paper/60">
                    {r.visitor.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-paper/85">
                      {r.seriesTitle} — Ch.{r.chapterNumber} {r.chapterTitle}
                    </p>
                    <p className="font-mono text-[9px] tracking-wider text-paper/35 uppercase">
                      {r.visitor.slice(0, 8)}… · {formatDate(r.at)}
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 border-2 border-ink bg-paper px-1.5 py-0.5 font-mono text-[10px] font-bold text-ink">
                    <Droplet className="size-3 fill-ink" /> {r.coins}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Checklist Konten" desc={`${issues.length} catatan`} accent="#C9F73A">
          {issues.length === 0 ? (
            <p className="flex items-center gap-2 font-mono text-xs text-acid">
              <Sparkles className="size-4" /> Semua konten rapi — mantap!
            </p>
          ) : (
            <ul className="flex max-h-80 flex-col gap-2 overflow-y-auto pr-1">
              {issues.map((i, idx) => (
                <li key={idx}>
                  <Link
                    href={i.href}
                    className="flex items-start gap-2.5 border-2 border-paper/15 bg-ink px-3 py-2.5 text-sm text-paper/75 transition-colors hover:border-acid"
                  >
                    {i.level === "warn" ? (
                      <FileWarning className="mt-0.5 size-4 shrink-0 text-brand" />
                    ) : (
                      <EyeOff className="mt-0.5 size-4 shrink-0 text-paper/40" />
                    )}
                    {i.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <SectionCard title="Pintasan Cepat" accent="#8B5CF6">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { href: "/admin/events/new", label: "+ Buat Edisi / Microsite Baru", desc: "Lengkap dengan tema warna sendiri" },
            { href: "/admin/series/new", label: "+ Tambah Judul Komik", desc: "Ikatan debut ke edisi event" },
            { href: "/admin/series", label: "+ Rilis Chapter Berbayar", desc: "Atur harga & halaman slice" },
          ].map((q) => (
            <Link
              key={q.label}
              href={q.href}
              className="group border-2 border-dashed border-paper/25 px-4 py-4 transition-colors hover:border-acid"
            >
              <p className="font-display text-sm text-paper uppercase group-hover:text-acid">{q.label}</p>
              <p className="mt-1 font-mono text-[10px] text-paper/40">{q.desc}</p>
            </Link>
          ))}
        </div>
      </SectionCard>

      <p className="font-mono text-[10px] tracking-wider text-paper/30 uppercase">
        Format tanggal di seluruh redaksi memakai zona WIB. Terakhir dilihat: {formatDateLong(new Date())}
      </p>
    </div>
  );
}
