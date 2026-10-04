import type { Metadata } from "next";
import { ShoppingBag, Sparkles, Store, Truck, ShieldCheck, HeartHandshake } from "lucide-react";
import { Marquee } from "@/components/marquee";
import { ProductExplorer } from "@/components/product-explorer";
import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { getPublishedProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Artshop & Official Merchandise",
  description:
    "Katalog merchandise resmi festival Comic Week, artbook edisi terbatas, apparel, gantungan kunci, dan print eksklusif. Beli langsung via e-commerce atau WhatsApp.",
};

export default async function ShopPage() {
  const products = await getPublishedProducts();

  return (
    <div>
      <SiteNav />

      <Marquee
        items={[
          "OFFICIAL COMIC WEEK MERCHANDISE",
          "ARTBOOK & LIMITED EDITION PRINTS",
          "APPAREL & FASHION RESMI FESTIVAL",
          "PENGIRIMAN AMAN KE SELURUH INDONESIA",
          "ORDER VIA TOKOPEDIA, SHOPEE & WHATSAPP",
        ]}
        fast
        className="border-b-3 border-paper/20 bg-ink text-paper/60"
      />

      {/* Hero Header */}
      <header className="halftone-dark relative overflow-hidden border-b-3 border-paper">
        <div className="pointer-events-none absolute -right-6 -bottom-14 select-none font-display text-[12rem] leading-none text-hollow opacity-10">
          SHOP
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
          <Reveal>
            <p className="inline-flex items-center gap-2 border-2 border-acid px-3 py-1.5 font-mono text-[10px] font-bold tracking-[0.3em] text-acid uppercase sm:text-xs">
              <ShoppingBag className="size-3.5" />
              Pasar Kreatif & Merchandise Resmi
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-5 font-display text-5xl leading-[0.85] text-paper uppercase sm:text-7xl">
              Artshop
              <br />
              <span className="text-acid">Comic Week</span>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-5 max-w-2xl leading-relaxed text-paper/70">
              Koleksi merchandise resmi festival dan karya kolaborasi kreator. Dapatkan artbook
              arsip, kaos festival, poster berlapis foil emas, gantungan kunci, hingga limited
              boxset. Pembelian dapat dilakukan langsung melalui e-commerce resmi atau chat WhatsApp.
            </p>
          </Reveal>

          {/* Highlight Benefit Bar */}
          <Reveal delay={0.24}>
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3 max-w-3xl">
              <div className="flex items-center gap-3 border-2 border-paper/20 bg-ink-soft/80 p-3">
                <Store className="size-5 shrink-0 text-acid" />
                <div className="leading-tight">
                  <p className="font-mono text-xs font-bold text-paper uppercase">100% Produk Resmi</p>
                  <p className="text-[11px] text-paper/50">Dilisensikan langsung oleh kreator</p>
                </div>
              </div>
              <div className="flex items-center gap-3 border-2 border-paper/20 bg-ink-soft/80 p-3">
                <Truck className="size-5 shrink-0 text-brand" />
                <div className="leading-tight">
                  <p className="font-mono text-xs font-bold text-paper uppercase">Kirim Seluruh Nusantara</p>
                  <p className="text-[11px] text-paper/50">Packing aman bubble wrap & kardus</p>
                </div>
              </div>
              <div className="flex items-center gap-3 border-2 border-paper/20 bg-ink-soft/80 p-3">
                <HeartHandshake className="size-5 shrink-0 text-[#8B5CF6]" />
                <div className="leading-tight">
                  <p className="font-mono text-xs font-bold text-paper uppercase">Dukung Kreator Lokal</p>
                  <p className="text-[11px] text-paper/50">Sebagian hasil kembali ke komikus</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </header>

      {/* Main Content Explorer */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <ProductExplorer products={products} />
      </main>

      <SiteFooter />
    </div>
  );
}
