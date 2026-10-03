import type { Metadata } from "next";
import { desc, eq, sql } from "drizzle-orm";
import { Droplet, ReceiptText, Trophy, Wallet } from "lucide-react";
import { SectionCard } from "@/components/admin/fields";
import { db } from "@/db";
import { chapters, purchases, series, wallets } from "@/db/schema";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Transaksi Koin" };

export default async function PurchasesPage() {
  const [rows, [totals], [walletCount], top] = await Promise.all([
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
      .limit(100),
    db
      .select({
        unlocks: sql<number>`count(*)::int`,
        coins: sql<number>`coalesce(sum(${purchases.coinsSpent}),0)::int`,
        readers: sql<number>`count(distinct ${purchases.visitorKey})::int`,
      })
      .from(purchases),
    db.select({ n: sql<number>`count(*)::int` }).from(wallets),
    db
      .select({
        chapterId: purchases.chapterId,
        n: sql<number>`count(*)::int`,
        coins: sql<number>`sum(${purchases.coinsSpent})::int`,
        chapterTitle: chapters.title,
        chapterNumber: chapters.number,
        seriesTitle: series.title,
      })
      .from(purchases)
      .innerJoin(chapters, eq(purchases.chapterId, chapters.id))
      .innerJoin(series, eq(chapters.seriesId, series.id))
      .groupBy(purchases.chapterId, chapters.title, chapters.number, series.title)
      .orderBy(desc(sql`count(*)`))
      .limit(5),
  ]);

  const summary = [
    { icon: ReceiptText, label: "Total Unlock", value: totals.unlocks, color: "#C9F73A" },
    { icon: Droplet, label: "Koin Dibelanjakan", value: totals.coins, color: "#FF4D00" },
    { icon: Wallet, label: "Pembaca Membeli", value: totals.readers, color: "#8B5CF6" },
    { icon: Wallet, label: "Dompet Terdaftar", value: walletCount.n, color: "#35E0FF" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="font-mono text-[10px] font-bold tracking-[0.3em] text-acid uppercase">Laporan</p>
        <h1 className="mt-2 font-display text-3xl text-paper uppercase sm:text-4xl">Transaksi Koin Tinta</h1>
        <p className="mt-2 max-w-xl text-sm text-paper/55">
          Semua pembelian chapter oleh pembaca. Identitas pembaca anonim (kunci pengunjung), sesuai
          desain tanpa akun.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {summary.map((s) => (
          <div key={s.label} className="border-3 border-paper/20 bg-ink-soft p-4">
            <span className="flex size-10 items-center justify-center border-3 border-ink text-ink shadow-[2px_2px_0_#f5f1e8]" style={{ backgroundColor: s.color }}>
              <s.icon className="size-5" strokeWidth={2.5} />
            </span>
            <p className="mt-3 font-display text-2xl text-paper">{s.value}</p>
            <p className="font-mono text-[9px] tracking-[0.18em] text-paper/50 uppercase">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <SectionCard title="Riwayat Pembelian" desc={`${rows.length} transaksi terakhir`} accent="#FF4D00">
          {rows.length === 0 ? (
            <p className="font-mono text-xs text-paper/40">
              Belum ada transaksi tercatat.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b-2 border-paper/15 font-mono text-[9px] tracking-[0.2em] text-paper/40 uppercase">
                    <th className="py-2 pr-3">Waktu</th>
                    <th className="py-2 pr-3">Pembaca</th>
                    <th className="py-2 pr-3">Chapter</th>
                    <th className="py-2 text-right">Koin</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-paper/8">
                  {rows.map((r) => (
                    <tr key={r.id} className="text-paper/75">
                      <td className="py-2.5 pr-3 font-mono text-xs whitespace-nowrap">{formatDate(r.at)}</td>
                      <td className="py-2.5 pr-3 font-mono text-xs text-paper/45">{r.visitor.slice(0, 8)}…</td>
                      <td className="py-2.5 pr-3">
                        <span className="font-bold text-paper/90">{r.seriesTitle}</span>
                        <span className="text-paper/50"> · Ch.{r.chapterNumber} {r.chapterTitle}</span>
                      </td>
                      <td className="py-2.5 text-right">
                        <span className="inline-flex items-center gap-1 border-2 border-ink bg-paper px-1.5 py-0.5 font-mono text-[10px] font-bold text-ink">
                          <Droplet className="size-3 fill-ink" />
                          {r.coins}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Paling Laris" desc="berdasar jumlah unlock" accent="#C9F73A">
          {top.length === 0 ? (
            <p className="font-mono text-xs text-paper/40">—</p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {top.map((t, i) => (
                <li key={t.chapterId} className="flex items-center gap-3 border-2 border-paper/15 bg-ink p-3">
                  <span className="flex size-8 shrink-0 items-center justify-center border-2 border-ink bg-acid font-display text-xs text-ink">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-paper/90">{t.seriesTitle}</p>
                    <p className="font-mono text-[9px] tracking-wider text-paper/40 uppercase">
                      Ch.{t.chapterNumber} {t.chapterTitle}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="flex items-center justify-end gap-1 font-mono text-xs font-bold text-acid">
                      <Trophy className="size-3" /> {t.n}×
                    </p>
                    <p className="font-mono text-[9px] text-paper/40">{t.coins} koin</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
