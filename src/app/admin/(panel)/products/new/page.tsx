import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ProductForm } from "@/components/admin/product-form";
import { db } from "@/db";
import { events } from "@/db/schema";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Tambah Produk Baru — Admin" };

export default async function NewProductPage() {
  const eventRows = await db
    .select({
      id: events.id,
      name: events.name,
      edition: events.edition,
      slug: events.slug,
    })
    .from(events);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 font-mono text-[11px] font-bold tracking-widest text-paper/50 uppercase hover:text-acid"
        >
          <ArrowLeft className="size-4" /> Semua Produk
        </Link>
        <h1 className="mt-3 font-display text-3xl text-paper uppercase sm:text-4xl">
          Tambah Produk Baru
        </h1>
        <p className="mt-2 max-w-xl text-sm text-paper/55">
          Tambahkan merchandise resmi, artbook, kaos festival, poster, atau aksesoris. Unggah foto
          langsung ke Vercel Blob dan masukkan link checkout (Tokopedia, Shopee, atau WA).
        </p>
      </header>

      <ProductForm defaults={{}} events={eventRows} />
    </div>
  );
}
