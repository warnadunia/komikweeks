import type { Metadata } from "next";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/admin/action-form";
import { SectionCard } from "@/components/admin/fields";
import { ProductForm } from "@/components/admin/product-form";
import { db } from "@/db";
import { events } from "@/db/schema";
import { deleteProduct } from "@/lib/admin-actions";
import { getProductByIdAdmin } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Kelola Produk — Admin" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);

  const [product, eventRows] = await Promise.all([
    getProductByIdAdmin(productId),
    db
      .select({
        id: events.id,
        name: events.name,
        edition: events.edition,
        slug: events.slug,
      })
      .from(events),
  ]);

  if (!product) notFound();

  async function removeProduct() {
    "use server";
    return deleteProduct(productId);
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 font-mono text-[11px] font-bold tracking-widest text-paper/50 uppercase hover:text-acid"
          >
            <ArrowLeft className="size-4" /> Semua Produk
          </Link>
          <h1 className="mt-3 font-display text-3xl text-paper uppercase sm:text-4xl">
            Kelola <span className="text-acid">{product.name}</span>
          </h1>
        </div>
        <Link
          href={`/shop/${product.slug}`}
          target="_blank"
          className="inline-flex items-center gap-2 border-2 border-acid px-4 py-2.5 font-mono text-[10px] font-bold tracking-widest text-acid uppercase transition-colors hover:bg-acid hover:text-ink"
        >
          <ExternalLink className="size-4" /> Lihat Halaman Publik
        </Link>
      </header>

      <ProductForm defaults={product} events={eventRows} />

      <SectionCard title="Zona Berbahaya" accent="#FF4D00" desc="tindakan permanen yang tidak dapat dibatalkan">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-bold text-paper">Hapus Produk dari Artshop</p>
            <p className="mt-1 text-xs text-paper/55">
              Produk ini akan dihapus permanen dari basis data dan tidak lagi dapat dibeli oleh pengunjung.
            </p>
          </div>
          <DeleteButton
            action={removeProduct}
            confirmText={`Yakin ingin menghapus produk "${product.name}"? Tindakan ini tidak dapat dibatalkan.`}
            label="Hapus Produk Permanen"
          />
        </div>
      </SectionCard>
    </div>
  );
}
