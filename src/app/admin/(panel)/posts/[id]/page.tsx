import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DeleteButton } from "@/components/admin/action-form";
import { SectionCard } from "@/components/admin/fields";
import { PostForm } from "@/components/admin/post-form";
import { db } from "@/db";
import { events, posts } from "@/db/schema";
import { deletePost } from "@/lib/admin-actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Edit Artikel — Admin" };

export default async function EditPostAdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const postId = Number(id);

  const [post, eventList] = await Promise.all([
    db.select().from(posts).where(eq(posts.id, postId)).limit(1).then((r) => r[0]),
    db
      .select({
        id: events.id,
        name: events.name,
        edition: events.edition,
        slug: events.slug,
      })
      .from(events)
      .orderBy(desc(events.startDate)),
  ]);

  if (!post) notFound();

  async function removePost() {
    "use server";
    const res = await deletePost(postId);
    if (res?.ok) {
      redirect("/admin/posts");
    }
    return res;
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/admin/posts"
            className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-paper/50 uppercase transition-colors hover:text-acid"
          >
            <ArrowLeft className="size-3.5" /> Kembali ke Daftar Artikel
          </Link>
          <h1 className="mt-2 font-display text-3xl text-paper uppercase sm:text-4xl">
            Edit Artikel
          </h1>
        </div>

        {post.isPublished && (
          <Link
            href={`/blog/${post.slug}`}
            target="_blank"
            className="inline-flex items-center gap-2 border-2 border-acid px-4 py-2 font-mono text-[11px] font-bold tracking-widest text-acid uppercase transition-colors hover:bg-acid hover:text-ink"
          >
            <ExternalLink className="size-3.5" /> Lihat di Portal
          </Link>
        )}
      </header>

      <PostForm
        defaults={{
          id: post.id,
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          coverImage: post.coverImage,
          category: post.category,
          eventId: post.eventId,
          author: post.author,
          isPublished: post.isPublished,
        }}
        events={eventList}
      />

      <SectionCard title="Zona Bahaya" accent="#FF4D00" desc="tindakan permanen">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-xs font-bold text-paper uppercase">Hapus Artikel Ini</p>
            <p className="font-mono text-[11px] text-paper/50">
              Artikel dan tautannya akan dihapus secara permanen dari portal dan microsite event.
            </p>
          </div>
          <DeleteButton
            action={removePost}
            confirmText={`Yakin ingin menghapus artikel "${post.title}"?`}
            label="Hapus Artikel"
          />
        </div>
      </SectionCard>
    </div>
  );
}
