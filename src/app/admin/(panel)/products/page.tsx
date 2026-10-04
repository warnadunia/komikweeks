import type { Metadata } from "next";
import { ArrowUpRight, ExternalLink, Globe, Plus, ShoppingBag, Store, Tag } from "lucide-react";
import Link from "next/link";
import { getAllProductsAdmin } from "@/lib/queries";
import { formatIDR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Artshop & Merchandise — Admin" };

export default async function AdminProductsPage() {
  const products = await getAllProductsAdmin();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] font-bold tracking-[0.3em] text-acid uppercase">
            Katalog Toko & Artshop
          </p>
          <h1 className="mt-2 font-display text-3xl text-paper uppercase sm:text-4xl">
            Merchandise & Artshop
          </h1>
          <p className="mt-2 max-w-xl text-sm text-paper/55">
            Kelola katalog merchandise resmi, artbook, kaos, poster, dan pernak-pernik festival Comic Week.
            Sistem pembelian menggunakan konsep tautan bebas (e-commerce atau direct chat WhatsApp).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/shop"
            target="_blank"
            className="inline-flex items-center gap-2 border-2 border-paper/40 px-4 py-2.5 font-mono text-xs font-bold tracking-widest text-paper uppercase transition-colors hover:border-acid hover:text-acid"
          >
            <ExternalLink className="size-4" /> Buka Artshop Publik
          </Link>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 border-3 border-ink bg-acid px-5 py-2.5 font-display text-sm tracking-wide text-ink uppercase shadow-[5px_5px_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[7px_7px_0_#000]"
          >
            <Plus className="size-4" strokeWidth={3} /> Tambah Produk Baru
          </Link>
        </div>
      </header>

      {/* Ringkasan Cepat */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="border-2 border-paper/20 bg-ink-soft p-4">
          <span className="font-mono text-[10px] tracking-widest text-paper/40 uppercase block">Total Produk</span>
          <span className="mt-1 font-mono text-2xl font-black text-paper">{products.length}</span>
        </div>
        <div className="border-2 border-paper/20 bg-ink-soft p-4">
          <span className="font-mono text-[10px] tracking-widest text-paper/40 uppercase block">Produk Aktif</span>
          <span className="mt-1 font-mono text-2xl font-black text-acid">
            {products.filter((p) => p.product.isPublished).length}
          </span>
        </div>
        <div className="border-2 border-paper/20 bg-ink-soft p-4">
          <span className="font-mono text-[10px] tracking-widest text-paper/40 uppercase block">Pre-Order (PO)</span>
          <span className="mt-1 font-mono text-2xl font-black text-[#8B5CF6]">
            {products.filter((p) => p.product.stockStatus === "pre_order").length}
          </span>
        </div>
        <div className="border-2 border-paper/20 bg-ink-soft p-4">
          <span className="font-mono text-[10px] tracking-widest text-paper/40 uppercase block">Produk Unggulan</span>
          <span className="mt-1 font-mono text-2xl font-black text-brand">
            {products.filter((p) => p.product.featured).length}
          </span>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="border-3 border-dashed border-paper/20 bg-ink-soft p-12 text-center">
          <ShoppingBag className="mx-auto size-12 text-paper/25" />
          <p className="mt-3 font-mono text-sm text-paper/40">Belum ada produk di katalog artshop.</p>
          <Link
            href="/admin/products/new"
            className="mt-4 inline-flex items-center gap-2 border-2 border-acid bg-acid/10 px-4 py-2 font-mono text-xs font-bold text-acid uppercase hover:bg-acid hover:text-ink"
          >
            <Plus className="size-4" /> Tambah Produk Pertama
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {products.map(({ product: p, eventName, eventEdition }) => (
            <Link
              key={p.id}
              href={`/admin/products/${p.id}`}
              className="group grid gap-4 border-3 border-paper/20 bg-ink-soft p-5 transition-all hover:-translate-y-1 hover:border-paper sm:grid-cols-[auto_1fr_auto] sm:items-center"
            >
              {/* Thumbnail Foto */}
              <div
                className="flex size-16 shrink-0 items-center justify-center border-2 border-paper/30 bg-ink bg-cover bg-center shadow-[2px_2px_0_#000]"
                style={{
                  backgroundImage: `url(${p.image || "/covers/default-cover.jpg"})`,
                }}
              />

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-lg text-paper uppercase group-hover:underline">
                    {p.name}
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
                  {p.featured && (
                    <span className="border-2 border-brand bg-brand/20 px-2 py-0.5 font-mono text-[9px] font-bold tracking-widest text-brand uppercase">
                      Unggulan
                    </span>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-xs text-paper/50">
                  <span className="font-bold text-acid">{formatIDR(p.price)}</span>
                  {p.originalPrice && p.originalPrice > p.price && (
                    <span className="line-through text-paper/30">{formatIDR(p.originalPrice)}</span>
                  )}
                  <span>•</span>
                  <span>{p.category}</span>
                  {p.badge && (
                    <>
                      <span>•</span>
                      <span className="text-paper/70 font-bold">{p.badge}</span>
                    </>
                  )}
                  {eventName && (
                    <>
                      <span>•</span>
                      <span className="text-acid/90 font-bold">
                        {eventName} {eventEdition ? `(${eventEdition})` : ""}
                      </span>
                    </>
                  )}
                  <span>•</span>
                  <span className="truncate max-w-[200px]">
                    Link: {p.buyLabel || "Checkout"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <span className="border-2 border-paper/30 bg-ink px-3 py-1.5 font-mono text-[10px] font-bold tracking-widest text-paper/70 uppercase group-hover:border-acid group-hover:text-acid transition-colors">
                  Edit Produk →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
