import type { Metadata } from "next";
import { ArrowUpRight, Calendar, Globe, Plus, Tag } from "lucide-react";
import Link from "next/link";
import { getAllPostsAdmin } from "@/lib/queries";
import { POST_CATEGORIES } from "@/lib/blog-constants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Blog & Kabar Informasi — Admin" };

export default async function AdminPostsPage() {
  const posts = await getAllPostsAdmin();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] font-bold tracking-[0.3em] text-acid uppercase">
            Portal Informasi
          </p>
          <h1 className="mt-2 font-display text-3xl text-paper uppercase sm:text-4xl">
            Blog & Kabar Kegiatan
          </h1>
          <p className="mt-2 max-w-xl text-sm text-paper/55">
            Kelola pengumuman, dokumentasi kegiatan festival, dan berita komik. Artikel dapat
            dihubungkan ke edisi event tertentu agar otomatis tampil pada microsite bersangkutan.
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-2 border-3 border-ink bg-acid px-5 py-3 font-display text-sm tracking-wide text-ink uppercase shadow-[5px_5px_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[7px_7px_0_#000]"
        >
          <Plus className="size-4" strokeWidth={3} /> Tulis Artikel Baru
        </Link>
      </header>

      {posts.length === 0 ? (
        <div className="border-3 border-dashed border-paper/20 bg-ink-soft p-12 text-center">
          <p className="font-mono text-sm text-paper/40">Belum ada artikel yang ditulis.</p>
          <Link
            href="/admin/posts/new"
            className="mt-4 inline-flex items-center gap-2 border-2 border-acid bg-acid/10 px-4 py-2 font-mono text-xs font-bold text-acid uppercase hover:bg-acid hover:text-ink"
          >
            <Plus className="size-4" /> Buat Artikel Pertama
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map(({ post: p, eventName, eventEdition }) => {
            const categoryLabel =
              POST_CATEGORIES.find((c) => c.value === p.category)?.label || p.category;

            return (
              <Link
                key={p.id}
                href={`/admin/posts/${p.id}`}
                className="group grid gap-4 border-3 border-paper/20 bg-ink-soft p-5 transition-all hover:-translate-y-1 hover:border-paper sm:grid-cols-[auto_1fr_auto] sm:items-center"
              >
                {/* Cover or placeholder */}
                <div
                  className="flex size-16 shrink-0 items-center justify-center border-2 border-paper/30 bg-ink bg-cover bg-center font-display text-xs text-paper/40 shadow-[2px_2px_0_#000]"
                  style={{
                    backgroundImage: `url(${p.coverImage || "/covers/default-cover.jpg"})`,
                  }}
                />

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-lg text-paper uppercase group-hover:underline">
                      {p.title}
                    </h2>
                    {p.isPublished ? (
                      <span className="inline-flex items-center gap-1 border-2 border-acid/70 bg-acid/10 px-2 py-0.5 font-mono text-[9px] font-bold tracking-widest text-acid uppercase">
                        <Globe className="size-3" /> Terbit
                      </span>
                    ) : (
                      <span className="border-2 border-paper/30 px-2 py-0.5 font-mono text-[9px] font-bold tracking-widest text-paper/40 uppercase">
                        Draft
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1 border border-paper/20 px-2 py-0.5 font-mono text-[9px] text-paper/70 uppercase">
                      <Tag className="size-2.5" /> {categoryLabel}
                    </span>

                    {eventName ? (
                      <span className="inline-flex items-center gap-1 border border-sky-400/50 bg-sky-400/10 px-2 py-0.5 font-mono text-[9px] text-sky-300 uppercase">
                        <Calendar className="size-2.5" /> {eventName} ({eventEdition})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-mono text-[9px] text-paper/40 uppercase">
                        General Portal
                      </span>
                    )}
                  </div>

                  {p.excerpt && (
                    <p className="mt-1 line-clamp-1 text-xs text-paper/60">{p.excerpt}</p>
                  )}

                  <p className="mt-1 font-mono text-[10px] tracking-wider text-paper/40 uppercase">
                    Oleh {p.author} •{" "}
                    {new Date(p.publishedAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <span className="inline-flex items-center gap-1.5 justify-self-start font-mono text-[10px] font-bold tracking-widest text-paper/50 uppercase transition-colors group-hover:text-acid sm:justify-self-end">
                  Edit <ArrowUpRight className="size-4" />
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
