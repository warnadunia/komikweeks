import type { Metadata } from "next";
import { ArrowLeft, Calendar, ChevronRight, Clock, Globe, Share2, Tag, User } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { POST_CATEGORIES } from "@/lib/blog-constants";
import { getPostBySlug, getPublishedPosts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Kabar Tidak Ditemukan — COMIC WEEK" };

  return {
    title: `${post.title} — COMIC WEEK`,
    description: post.excerpt ?? `Kabar dan update kegiatan Comic Week: ${post.title}`,
    openGraph: post.coverImage ? { images: [post.coverImage] } : undefined,
  };
}

function renderContent(content: string) {
  // Parsing sederhana untuk paragraf, gambar markdown ![alt](url), dan subjudul ##
  const blocks = content.split("\n\n");

  return blocks.map((block, idx) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    // Gambar markdown: ![alt](url)
    const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imgMatch) {
      const alt = imgMatch[1] || "Dokumentasi kegiatan";
      const src = imgMatch[2];
      return (
        <figure key={idx} className="my-8 overflow-hidden border-3 border-paper/40 bg-ink">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} className="w-full object-cover" />
          {alt && alt !== "Foto kegiatan" && (
            <figcaption className="border-t-2 border-paper/20 bg-ink-soft p-3 font-mono text-[11px] text-paper/60">
              // {alt}
            </figcaption>
          )}
        </figure>
      );
    }

    // Subjudul H2: ## Judul
    if (trimmed.startsWith("## ")) {
      return (
        <h2
          key={idx}
          className="mt-8 mb-4 font-display text-2xl tracking-wide text-paper uppercase sm:text-3xl"
        >
          {trimmed.replace(/^##\s+/, "")}
        </h2>
      );
    }

    // Subjudul H3: ### Judul
    if (trimmed.startsWith("### ")) {
      return (
        <h3
          key={idx}
          className="mt-6 mb-3 font-display text-xl text-acid uppercase sm:text-2xl"
        >
          {trimmed.replace(/^###\s+/, "")}
        </h3>
      );
    }

    // Blockquote: > Teks
    if (trimmed.startsWith("> ")) {
      return (
        <blockquote
          key={idx}
          className="my-6 border-l-4 border-acid bg-ink-soft py-3 pr-4 pl-5 font-mono text-sm italic text-paper/80"
        >
          {trimmed.replace(/^>\s+/, "")}
        </blockquote>
      );
    }

    // Paragraf biasa
    return (
      <p key={idx} className="mb-5 text-base leading-relaxed text-paper/85 sm:text-lg">
        {trimmed}
      </p>
    );
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  // Ambil artikel lain untuk rekomendasi bacaan
  const otherPosts = (await getPublishedPosts({ limit: 4 })).filter((p) => p.id !== post.id);

  const catLabel = POST_CATEGORIES.find((c) => c.value === post.category)?.label || post.category;

  return (
    <div className="relative min-h-screen">
      <SiteNav />

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
        {/* Breadcrumb & Navigation */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 font-mono text-xs text-paper/50">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 uppercase transition-colors hover:text-acid"
          >
            <ArrowLeft className="size-3.5" /> Semua Kabar
          </Link>

          {post.eventName && post.eventSlug && (
            <Link
              href={`/events/${post.eventSlug}`}
              className="inline-flex items-center gap-1.5 border border-sky-400/40 bg-sky-400/10 px-2.5 py-1 font-mono text-[10px] font-bold text-sky-300 uppercase hover:bg-sky-400 hover:text-ink"
            >
              <Calendar className="size-3" />
              Microsite {post.eventName}
            </Link>
          )}
        </div>

        {/* Header Artikel */}
        <header className="border-b-3 border-paper/20 pb-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="border-2 border-ink bg-acid px-3 py-1 font-mono text-[10px] font-bold tracking-widest text-ink uppercase shadow-[2px_2px_0_#fff]">
              {catLabel}
            </span>

            {post.eventName ? (
              <span className="inline-flex items-center gap-1 font-mono text-xs text-paper/60 uppercase">
                <Calendar className="size-3" /> {post.eventName}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-mono text-xs text-paper/50 uppercase">
                <Globe className="size-3" /> General Portal
              </span>
            )}
          </div>

          <h1 className="mt-4 font-display text-3xl leading-[1.05] tracking-tight text-paper uppercase sm:text-5xl lg:text-6xl">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="mt-4 text-lg leading-relaxed text-paper/70 sm:text-xl">
              {post.excerpt}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-4 font-mono text-xs text-paper/50">
            <span className="inline-flex items-center gap-1.5">
              <User className="size-3.5 text-paper/40" />
              {post.author}
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5 text-paper/40" />
              {new Date(post.publishedAt).toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </header>

        {/* Foto Sampul Utama */}
        <div className="my-8 overflow-hidden border-3 border-paper shadow-[8px_8px_0_#c9f73a]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.coverImage || "/covers/default-cover.jpg"}
            alt={post.title}
            className="max-h-[500px] w-full object-cover"
          />
        </div>

        {/* Konten Utama Artikel */}
        <article className="prose prose-invert mt-8 max-w-none">
          {renderContent(post.content)}
        </article>

        {/* Event Banner Box (Jika terhubung ke suatu event) */}
        {post.eventName && post.eventSlug && (
          <div className="mt-12 border-3 border-acid bg-ink-soft p-6 shadow-[6px_6px_0_#c9f73a]">
            <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-acid uppercase">
              Agenda & Informasi Resmi Edisi Ini
            </p>
            <h3 className="mt-1 font-display text-2xl text-paper uppercase sm:text-3xl">
              {post.eventName} ({post.eventEdition})
            </h3>
            <p className="mt-2 text-sm text-paper/70">
              Lihat jadwal panggung, guest star internasional & lokal, tiket masuk, dan deretan
              komik debut yang diluncurkan khusus di edisi ini.
            </p>
            <Link
              href={`/events/${post.eventSlug}`}
              className="mt-4 inline-flex items-center gap-2 border-2 border-ink bg-acid px-5 py-2.5 font-display text-xs tracking-wider text-ink uppercase shadow-[3px_3px_0_#fff] transition-transform hover:-translate-y-0.5"
            >
              Buka Microsite {post.eventName} <ChevronRight className="size-4" />
            </Link>
          </div>
        )}

        {/* Rekomendasi Kabar Lainnya */}
        {otherPosts.length > 0 && (
          <section className="mt-16 border-t-3 border-paper/20 pt-10">
            <h2 className="font-display text-2xl text-paper uppercase sm:text-3xl">
              Kabar & Berita Lainnya
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {otherPosts.slice(0, 3).map((item) => (
                <Link
                  key={item.id}
                  href={`/blog/${item.slug}`}
                  className="group flex flex-col border-2 border-paper/20 bg-ink-soft p-4 transition-all hover:-translate-y-1 hover:border-paper hover:shadow-[4px_4px_0_#c9f73a]"
                >
                  <span className="font-mono text-[9px] font-bold text-acid uppercase">
                    {item.eventName || "Portal Umum"}
                  </span>
                  <h4 className="mt-2 line-clamp-2 font-display text-base text-paper uppercase group-hover:underline">
                    {item.title}
                  </h4>
                  <time className="mt-auto pt-3 font-mono text-[10px] text-paper/40">
                    {new Date(item.publishedAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </time>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
