import type { Metadata } from "next";
import {
  ArrowLeft,
  CalendarRange,
  CheckCircle2,
  ExternalLink,
  HeartHandshake,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Store,
  Tag,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatIDR, ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { getProductBySlug, getPublishedProducts } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Produk Tidak Ditemukan" };

  return {
    title: `${product.name} — Artshop Comic Week`,
    description: product.description || `Beli ${product.name} resmi di Artshop Comic Week.`,
    openGraph: {
      title: product.name,
      description: product.description || "",
      images: [product.image],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  // Ambil produk rekomendasi lainnya
  const allProducts = await getPublishedProducts();
  const related = allProducts.filter((p) => p.slug !== product.slug).slice(0, 3);

  const isPreOrder = product.stockStatus === "pre_order";
  const isOutOfStock = product.stockStatus === "out_of_stock";

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  return (
    <div>
      <SiteNav />

      {/* Breadcrumb Bar */}
      <div className="border-b-2 border-paper/20 bg-ink-soft py-3 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl flex items-center gap-2 font-mono text-xs text-paper/60">
          <Link href="/" className="hover:text-acid transition-colors">
            Beranda
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-acid transition-colors">
            Artshop
          </Link>
          <span>/</span>
          <span className="truncate text-paper">{product.name}</span>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_1fr]">
          {/* Kolom Kiri: Foto Produk */}
          <div>
            <div className="relative overflow-hidden border-3 border-paper bg-ink shadow-[10px_10px_0_#f5f1e8]">
              <img
                src={product.image}
                alt={product.name}
                className="aspect-square w-full object-cover"
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 items-start">
                {product.badge && (
                  <span className="border-2 border-ink bg-acid px-3 py-1 font-mono text-xs font-black tracking-widest text-ink uppercase shadow-[3px_3px_0_#000]">
                    {product.badge}
                  </span>
                )}
                {discountPercent && (
                  <span className="border-2 border-ink bg-brand px-2.5 py-1 font-mono text-xs font-black tracking-wider text-paper uppercase shadow-[3px_3px_0_#000]">
                    Hemat {discountPercent}%
                  </span>
                )}
              </div>

              {/* Status Stok */}
              <div className="absolute top-4 right-4">
                {isOutOfStock ? (
                  <span className="border-2 border-paper/40 bg-ink/90 px-3 py-1 font-mono text-xs font-bold tracking-wider text-paper/60 uppercase backdrop-blur-sm">
                    Stok Habis
                  </span>
                ) : isPreOrder ? (
                  <span className="border-2 border-ink bg-[#8B5CF6] px-3 py-1 font-mono text-xs font-bold tracking-wider text-paper uppercase shadow-[3px_3px_0_#000]">
                    Pre-Order
                  </span>
                ) : (
                  <span className="border-2 border-paper/50 bg-ink/90 px-3 py-1 font-mono text-xs font-bold tracking-wider text-acid uppercase backdrop-blur-sm shadow-[2px_2px_0_#000]">
                    Ready Stock
                  </span>
                )}
              </div>
            </div>

            {/* Jaminan Pembelian */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-2 border-2 border-paper/20 bg-ink-soft p-3">
                <Store className="size-4 shrink-0 text-acid" />
                <span className="font-mono text-[11px] text-paper/70">Official Merchandise</span>
              </div>
              <div className="flex items-center gap-2 border-2 border-paper/20 bg-ink-soft p-3">
                <Truck className="size-4 shrink-0 text-brand" />
                <span className="font-mono text-[11px] text-paper/70">Kirim Seluruh RI</span>
              </div>
              <div className="col-span-2 sm:col-span-1 flex items-center gap-2 border-2 border-paper/20 bg-ink-soft p-3">
                <ShieldCheck className="size-4 shrink-0 text-[#8B5CF6]" />
                <span className="font-mono text-[11px] text-paper/70">Kemasan Aman</span>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Detail & Checkout Action */}
          <div className="flex flex-col">
            {/* Event Tag */}
            {product.eventName && (
              <div className="mb-3 inline-flex items-center gap-2 border-2 border-acid/50 bg-acid/10 px-3 py-1 font-mono text-xs font-bold text-acid tracking-widest uppercase self-start">
                <CalendarRange className="size-3.5" />
                <span>
                  {product.eventName} {product.eventEdition ? `• ${product.eventEdition}` : ""}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 font-mono text-xs font-bold tracking-widest text-paper/50 uppercase">
              <span>{product.category}</span>
            </div>

            <h1 className="mt-2 font-display text-3xl sm:text-4xl text-paper uppercase leading-tight">
              {product.name}
            </h1>

            {/* Harga Box */}
            <div className="mt-6 border-3 border-paper bg-ink-soft p-5 shadow-[4px_4px_0_#c9f73a]">
              <span className="font-mono text-[11px] tracking-widest text-paper/40 uppercase block">
                Harga Resmi
              </span>
              <div className="mt-1 flex items-baseline gap-3">
                <span className="font-mono text-3xl font-black text-acid">
                  {formatIDR(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="font-mono text-base text-paper/40 line-through">
                    {formatIDR(product.originalPrice)}
                  </span>
                )}
              </div>

              {/* Action Buttons Box */}
              <div className="mt-5 flex flex-col gap-3">
                <a
                  href={product.buyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "flex items-center justify-center gap-2 border-3 border-ink px-6 py-4 font-mono text-sm font-black tracking-widest uppercase transition-transform hover:-translate-y-0.5",
                    isOutOfStock
                      ? "pointer-events-none opacity-50 bg-paper/20 text-paper/40 border-paper/30"
                      : "bg-acid text-ink shadow-[4px_4px_0_#000] hover:bg-paper"
                  )}
                >
                  <ShoppingBag className="size-5 shrink-0" />
                  <span>{product.buyLabel || "Beli Sekarang"}</span>
                  <ExternalLink className="size-4 shrink-0 opacity-70" />
                </a>

                {product.secondaryBuyUrl && (
                  <a
                    href={product.secondaryBuyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 border-2 border-paper/40 bg-ink px-4 py-3 font-mono text-xs font-bold text-paper tracking-wider uppercase transition-colors hover:border-[#25D366] hover:text-[#25D366]"
                  >
                    <MessageCircle className="size-4 text-[#25D366]" />
                    <span>{product.secondaryBuyLabel || "Pesan via WhatsApp"}</span>
                  </a>
                )}
              </div>

              <p className="mt-3 text-center font-mono text-[10px] text-paper/50 tracking-wider uppercase">
                ⚡ Transaksi langsung diproses melalui link toko / customer service resmi.
              </p>
            </div>

            {/* Deskripsi Lengkap */}
            <div className="mt-8 border-t-2 border-paper/20 pt-6">
              <h3 className="font-mono text-xs font-bold tracking-[0.2em] text-paper/60 uppercase">
                Deskripsi & Spesifikasi Produk
              </h3>
              <div className="mt-3 whitespace-pre-line text-sm leading-relaxed text-paper/80">
                {product.description || "Tidak ada deskripsi rinci untuk produk ini."}
              </div>
            </div>
          </div>
        </div>

        {/* Produk Terkait / Rekomendasi */}
        {related.length > 0 && (
          <section className="mt-20 border-t-3 border-paper pt-12">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-xs font-bold tracking-[0.2em] text-acid uppercase">
                  Katalog Pilihan
                </p>
                <h2 className="mt-1 font-display text-2xl text-paper uppercase sm:text-3xl">
                  Merchandise Lainnya
                </h2>
              </div>
              <Link
                href="/shop"
                className="inline-flex items-center gap-1 font-mono text-xs font-bold tracking-widest text-paper/60 uppercase hover:text-acid"
              >
                Lihat Semua Artshop →
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
