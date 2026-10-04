"use client";

import { ExternalLink, MessageCircle, ShoppingBag, Sparkles, Tag } from "lucide-react";
import Link from "next/link";
import type { ProductCardData } from "@/lib/queries";
import { cn } from "@/lib/utils";

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ProductCard({ p }: { p: ProductCardData }) {
  const isPreOrder = p.stockStatus === "pre_order";
  const isOutOfStock = p.stockStatus === "out_of_stock";

  const discountPercent =
    p.originalPrice && p.originalPrice > p.price
      ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
      : null;

  return (
    <div className="group relative flex flex-col border-3 border-paper bg-ink shadow-[6px_6px_0_#f5f1e8] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[10px_10px_0_var(--color-acid)]">
      {/* Gambar Produk */}
      <Link href={`/shop/${p.slug}`} className="relative block overflow-hidden border-b-3 border-paper bg-ink-soft">
        <div
          className="aspect-square w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url(${p.image})` }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-ink/10" />

        {/* Badge status / promo */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 items-start">
          {p.badge && (
            <span className="border-2 border-ink bg-acid px-2 py-0.5 font-mono text-[9px] font-black tracking-widest text-ink uppercase shadow-[2px_2px_0_#000]">
              {p.badge}
            </span>
          )}
          {discountPercent && (
            <span className="border-2 border-ink bg-brand px-1.5 py-0.5 font-mono text-[9px] font-black tracking-wider text-paper uppercase shadow-[2px_2px_0_#000]">
              Hemat {discountPercent}%
            </span>
          )}
        </div>

        {/* Stock Status Badge */}
        <div className="absolute top-2.5 right-2.5">
          {isOutOfStock ? (
            <span className="border-2 border-paper/40 bg-ink/90 px-2 py-0.5 font-mono text-[9px] font-bold tracking-wider text-paper/60 uppercase backdrop-blur-sm">
              Habis
            </span>
          ) : isPreOrder ? (
            <span className="border-2 border-ink bg-[#8B5CF6] px-2 py-0.5 font-mono text-[9px] font-bold tracking-wider text-paper uppercase shadow-[2px_2px_0_#000]">
              Pre-Order
            </span>
          ) : (
            <span className="border border-paper/40 bg-ink/80 px-2 py-0.5 font-mono text-[9px] font-bold tracking-wider text-paper/80 uppercase backdrop-blur-sm">
              Ready Stock
            </span>
          )}
        </div>

        {/* Event Association Tag */}
        {p.eventName && (
          <div className="absolute bottom-2 left-2 max-w-[90%]">
            <span className="inline-block truncate border border-paper/50 bg-ink/90 px-2 py-0.5 font-mono text-[9px] font-bold tracking-widest text-acid uppercase backdrop-blur-sm">
              {p.eventName} {p.eventEdition ? `(${p.eventEdition})` : ""}
            </span>
          </div>
        )}
      </Link>

      {/* Info Produk */}
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <div className="flex items-center justify-between gap-2 font-mono text-[10px] tracking-widest text-paper/50 uppercase">
            <span className="truncate">{p.category}</span>
          </div>

          <Link href={`/shop/${p.slug}`} className="mt-1 block">
            <h3 className="line-clamp-2 font-display text-lg leading-tight text-paper uppercase transition-colors group-hover:text-acid">
              {p.name}
            </h3>
          </Link>

          {p.description && (
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-paper/60">
              {p.description}
            </p>
          )}
        </div>

        {/* Pricing & CTA */}
        <div className="mt-4 pt-3 border-t-2 border-dashed border-paper/20">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-lg font-black text-acid">
              {formatIDR(p.price)}
            </span>
            {p.originalPrice && p.originalPrice > p.price && (
              <span className="font-mono text-xs text-paper/40 line-through">
                {formatIDR(p.originalPrice)}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <a
              href={p.buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 border-2 border-ink px-3 py-2 font-mono text-[11px] font-bold tracking-widest uppercase transition-all",
                isOutOfStock
                  ? "pointer-events-none opacity-50 bg-paper/20 text-paper/40 border-paper/30"
                  : "bg-acid text-ink shadow-[2px_2px_0_#000] hover:bg-paper hover:shadow-[3px_3px_0_#c9f73a]"
              )}
            >
              <ShoppingBag className="size-3.5 shrink-0" />
              <span className="truncate">{p.buyLabel || "Beli Sekarang"}</span>
              <ExternalLink className="size-3 shrink-0 opacity-70" />
            </a>

            {p.secondaryBuyUrl ? (
              <a
                href={p.secondaryBuyUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={p.secondaryBuyLabel || "Tanya via WhatsApp"}
                className="flex items-center justify-center gap-1 border-2 border-paper/30 bg-ink px-2.5 py-2 font-mono text-[11px] font-bold text-paper/80 uppercase transition-colors hover:border-paper hover:text-acid"
              >
                <MessageCircle className="size-3.5 shrink-0 text-[#25D366]" />
                <span className="hidden lg:inline text-[10px]">{p.secondaryBuyLabel || "WA"}</span>
              </a>
            ) : (
              <Link
                href={`/shop/${p.slug}`}
                className="flex items-center justify-center border-2 border-paper/30 bg-ink px-2.5 py-2 font-mono text-[10px] font-bold tracking-wider text-paper/70 uppercase transition-colors hover:border-paper hover:text-paper"
              >
                Detail
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
