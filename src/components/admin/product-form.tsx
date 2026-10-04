"use client";

import { Calendar, ExternalLink, Image as ImageIcon, MessageCircle, ShoppingBag, Sparkles } from "lucide-react";
import { useState } from "react";
import { upsertProduct, type FormState } from "@/lib/admin-actions";
import { ActionForm } from "@/components/admin/action-form";
import { CheckRow, Field, inputCls, SectionCard } from "@/components/admin/fields";
import { BlobUploader } from "@/components/admin/blob-uploader";

export const PRODUCT_CATEGORIES = [
  "Apparel",
  "Artbook",
  "Aksesoris",
  "Poster & Art Print",
  "Special Boxset",
  "Merchandise",
];

export const BADGE_SUGGESTIONS = [
  "Official Festival Merch",
  "Limited Edition",
  "Pre-Order",
  "Event Exclusive",
  "Kolektor Edition",
  "Bestseller",
];

export type ProductFormDefaults = {
  id?: number;
  slug?: string;
  name?: string;
  description?: string | null;
  price?: number;
  originalPrice?: number | null;
  category?: string;
  badge?: string | null;
  image?: string;
  buyUrl?: string;
  buyLabel?: string;
  secondaryBuyUrl?: string | null;
  secondaryBuyLabel?: string | null;
  stockStatus?: string;
  eventId?: number | null;
  featured?: boolean;
  isPublished?: boolean;
};

function slugify(v: string) {
  return v
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function ProductForm({
  defaults = {},
  events = [],
}: {
  defaults?: ProductFormDefaults;
  events?: { id: number; name: string; edition: string; slug: string }[];
}) {
  const d = defaults;
  const [name, setName] = useState(d.name ?? "");
  const [slug, setSlug] = useState(d.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!d.id);
  const [image, setImage] = useState(d.image ?? "");
  const [price, setPrice] = useState<number | string>(d.price ?? 50000);
  const [originalPrice, setOriginalPrice] = useState<number | string>(d.originalPrice ?? "");
  const [category, setCategory] = useState(d.category ?? "Merchandise");
  const [customCategory, setCustomCategory] = useState("");
  const [badge, setBadge] = useState(d.badge ?? "");
  const [stockStatus, setStockStatus] = useState(d.stockStatus ?? "in_stock");
  const [buyUrl, setBuyUrl] = useState(d.buyUrl ?? "");
  const [buyLabel, setBuyLabel] = useState(d.buyLabel ?? "Beli di Tokopedia");
  const [secondaryBuyUrl, setSecondaryBuyUrl] = useState(d.secondaryBuyUrl ?? "");
  const [secondaryBuyLabel, setSecondaryBuyLabel] = useState(d.secondaryBuyLabel ?? "Pesan via WhatsApp");
  const [selectedEventId, setSelectedEventId] = useState<string>(
    d.eventId ? String(d.eventId) : "none",
  );

  const selectedEvent = events.find((e) => String(e.id) === selectedEventId);

  const action = (prev: FormState, fd: FormData) => upsertProduct(prev, fd);

  const setPresetWhatsApp = () => {
    const encoded = encodeURIComponent(`Halo Admin Comic Week, saya ingin bertanya seputar produk ${name || "Merchandise"}`);
    setSecondaryBuyUrl(`https://wa.me/6281234567890?text=${encoded}`);
    setSecondaryBuyLabel("Pesan via WhatsApp");
  };

  return (
    <ActionForm
      action={action}
      submit={d.id ? "Simpan Perubahan Produk" : "Terbitkan Produk Baru"}
      className="flex flex-col gap-6"
    >
      {d.id && <input type="hidden" name="id" value={d.id} />}

      {/* Identitas Produk */}
      <SectionCard
        title="Informasi & Identitas Produk"
        accent="#c9f73a"
        desc="nama produk, slug URL, kategori, dan keterkaitan edisi event"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama Produk" hint="misal: Comic Week 2026 Oversized Tee — Acid Cyber Edition">
            <input
              type="text"
              name="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              placeholder="Nama merchandise / artbook"
              className={inputCls}
              required
            />
          </Field>

          <Field label="Slug URL" hint="unik, huruf kecil & tanda hubung">
            <input
              type="text"
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
              placeholder="comic-week-2026-tshirt"
              className={inputCls}
              required
            />
          </Field>

          <Field label="Kategori Produk">
            <div className="flex gap-2">
              <select
                name="categorySelect"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputCls}
              >
                {PRODUCT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="custom">+ Kategori Lainnya</option>
              </select>
            </div>
            {category === "custom" && (
              <input
                type="text"
                placeholder="Tulis nama kategori baru..."
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className={`${inputCls} mt-2`}
                required
              />
            )}
            <input
              type="hidden"
              name="category"
              value={category === "custom" ? customCategory : category}
            />
          </Field>

          <Field label="Kaitkan ke Edisi Event (Opsional)">
            <select
              name="eventId"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className={inputCls}
            >
              <option value="none">— Merchandise Umum / Bukan Edisi Khusus —</option>
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.edition})
                </option>
              ))}
            </select>
            {selectedEvent && (
              <p className="mt-1 font-mono text-[10px] text-acid">
                ✓ Produk akan otomatis diberi badge edisi: {selectedEvent.name} ({selectedEvent.edition})
              </p>
            )}
          </Field>
        </div>

        {/* Badge & Stock Status */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Badge / Label Promosi (Opsional)">
            <input
              type="text"
              name="badge"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              placeholder="Contoh: Official Festival Merch, Limited Edition, Pre-Order"
              className={inputCls}
            />
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {BADGE_SUGGESTIONS.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setBadge(s)}
                  className="cursor-pointer border border-paper/20 bg-ink px-1.5 py-0.5 font-mono text-[9px] text-paper/70 hover:border-acid hover:text-acid"
                >
                  +{s}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Status Ketersediaan Stok">
            <select
              name="stockStatus"
              value={stockStatus}
              onChange={(e) => setStockStatus(e.target.value)}
              className={inputCls}
            >
              <option value="in_stock">Ready Stock (Tersedia Langsung)</option>
              <option value="pre_order">Pre-Order (PO / Pemesanan Awal)</option>
              <option value="out_of_stock">Stok Habis (Sold Out)</option>
            </select>
          </Field>
        </div>
      </SectionCard>

      {/* Harga & Link Pembelian */}
      <SectionCard
        title="Harga & Link Pembelian (Checkout Bebas)"
        accent="#ff4d00"
        desc="atur nominal harga dan link toko online / direct WA bebas diisi"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Harga Jual (Rupiah)" hint="masukkan angka tanpa titik/koma">
            <div className="relative flex items-center">
              <span className="absolute left-3 font-mono text-xs font-bold text-acid">Rp</span>
              <input
                type="number"
                name="price"
                min={1000}
                step={500}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={`${inputCls} pl-10`}
                required
              />
            </div>
          </Field>

          <Field label="Harga Coret / Normal (Opsional)" hint="untuk menampilkan diskon coret">
            <div className="relative flex items-center">
              <span className="absolute left-3 font-mono text-xs font-bold text-paper/40">Rp</span>
              <input
                type="number"
                name="originalPrice"
                min={0}
                step={500}
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="Kosongkan jika tidak ada diskon"
                className={`${inputCls} pl-10`}
              />
            </div>
          </Field>
        </div>

        {/* Link Pembelian 1 (Utama) */}
        <div className="mt-4 grid gap-4 sm:grid-cols-[2fr_1fr]">
          <Field
            label="Link Pembelian Utama (URL Tokopedia / Shopee / E-commerce / Web)"
            hint="link bebas, saat diklik pengunjung akan diarahkan ke URL ini"
          >
            <input
              type="url"
              name="buyUrl"
              value={buyUrl}
              onChange={(e) => setBuyUrl(e.target.value)}
              placeholder="https://tokopedia.com/... atau https://shopee.co.id/..."
              className={inputCls}
              required
            />
          </Field>

          <Field label="Label Tombol Utama">
            <input
              type="text"
              name="buyLabel"
              value={buyLabel}
              onChange={(e) => setBuyLabel(e.target.value)}
              placeholder="Beli di Tokopedia / Beli Sekarang"
              className={inputCls}
              required
            />
          </Field>
        </div>

        {/* Link Pembelian 2 (Sekunder / WA) */}
        <div className="mt-4 grid gap-4 sm:grid-cols-[2fr_1fr]">
          <Field
            label="Link Pembelian Alternatif / WhatsApp (Opsional)"
            hint="contoh: https://wa.me/6281234567890?text=..."
          >
            <div className="flex gap-2">
              <input
                type="url"
                name="secondaryBuyUrl"
                value={secondaryBuyUrl}
                onChange={(e) => setSecondaryBuyUrl(e.target.value)}
                placeholder="https://wa.me/628... atau link cadangan"
                className={inputCls}
              />
              <button
                type="button"
                onClick={setPresetWhatsApp}
                className="shrink-0 cursor-pointer border-2 border-paper/30 bg-ink px-2.5 py-1.5 font-mono text-[10px] font-bold text-paper/80 uppercase hover:border-[#25D366] hover:text-[#25D366]"
                title="Format otomatis link WA"
              >
                Format WA
              </button>
            </div>
          </Field>

          <Field label="Label Tombol Sekunder">
            <input
              type="text"
              name="secondaryBuyLabel"
              value={secondaryBuyLabel}
              onChange={(e) => setSecondaryBuyLabel(e.target.value)}
              placeholder="Pesan via WhatsApp / Tanya Admin"
              className={inputCls}
            />
          </Field>
        </div>
      </SectionCard>

      {/* Foto Produk */}
      <SectionCard
        title="Foto Produk"
        accent="#8B5CF6"
        desc="unggah langsung ke Vercel Blob (kompresi otomatis WebP)"
      >
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1 flex flex-col gap-3">
            <Field label="URL Foto Produk" hint="diisi otomatis setelah mengunggah gambar">
              <input
                type="url"
                name="image"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://...public.blob.vercel-storage.com/... atau URL gambar eksternal"
                className={inputCls}
                required
              />
            </Field>

            <BlobUploader
              folder="events"
              label="Unggah Foto Produk ke Vercel Blob"
              onSuccess={(results) => {
                if (results[0]?.url) {
                  setImage(results[0].url);
                }
              }}
            />
          </div>

          {/* Preview Box */}
          <div className="w-full sm:w-56 shrink-0">
            <span className="font-mono text-[10px] tracking-widest text-paper/50 uppercase block mb-1">
              Preview Sampul
            </span>
            <div className="aspect-square border-3 border-paper bg-ink-soft overflow-hidden flex items-center justify-center relative">
              {image ? (
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-paper/30">
                  <ImageIcon className="size-8" />
                  <span className="font-mono text-[9px] uppercase">Belum ada foto</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Deskripsi & Pengaturan Tampilan */}
      <SectionCard title="Deskripsi & Penerbitan" accent="#35e0ff" desc="detail spesifikasi dan status rilis">
        <Field label="Deskripsi Lengkap Produk" hint="spesifikasi bahan, ukuran, konten, sertifikat, dsb">
          <textarea
            name="description"
            rows={5}
            defaultValue={d.description ?? ""}
            placeholder="Jelaskan detail material produk, edisi rilis, dan kelengkapan paket..."
            className={inputCls}
          />
        </Field>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:gap-6">
          <CheckRow
            name="isPublished"
            label="Tampilkan di Artshop Publik (Aktif)"
            defaultChecked={d.isPublished !== false}
          />
          <CheckRow
            name="featured"
            label="Produk Unggulan (Tampil di urutan teratas)"
            defaultChecked={d.featured}
          />
        </div>
      </SectionCard>
    </ActionForm>
  );
}
