import dotenv from "dotenv";
dotenv.config({ path: [".env.local", ".env"] });
import { sql } from "drizzle-orm";

async function main() {
  const { db } = await import("../src/db");
  const { events, products } = await import("../src/db/schema");

  console.log("→ Memeriksa dan membuat tabel products jika belum ada...");

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "products" (
      "id" serial PRIMARY KEY NOT NULL,
      "slug" varchar(140) NOT NULL UNIQUE,
      "name" varchar(220) NOT NULL,
      "description" text,
      "price" integer NOT NULL,
      "original_price" integer,
      "category" varchar(80) DEFAULT 'Merchandise' NOT NULL,
      "badge" varchar(80),
      "image" varchar(500) NOT NULL,
      "buy_url" varchar(500) NOT NULL,
      "buy_label" varchar(80) DEFAULT 'Beli Sekarang' NOT NULL,
      "secondary_buy_url" varchar(500),
      "secondary_buy_label" varchar(80) DEFAULT 'Tanya via WhatsApp',
      "stock_status" varchar(30) DEFAULT 'in_stock' NOT NULL,
      "event_id" integer REFERENCES "events"("id") ON DELETE SET NULL,
      "featured" boolean DEFAULT false NOT NULL,
      "is_published" boolean DEFAULT true NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "products_category_idx" ON "products" ("category");
    CREATE INDEX IF NOT EXISTS "products_event_idx" ON "products" ("event_id");
    CREATE INDEX IF NOT EXISTS "products_published_idx" ON "products" ("is_published");
  `);

  console.log("✓ Tabel products siap di Neon PostgreSQL.");

  // Cek apakah sudah ada produk
  const existingCount = await db.select({ count: sql<number>`count(*)::int` }).from(products);
  if (existingCount[0].count > 0) {
    console.log(`Sudah ada ${existingCount[0].count} produk di database.`);
    return;
  }

  console.log("→ Menambahkan sampel katalog produk official merchandise Comic Week...");

  const allEvents = await db.select().from(events);
  const ev2026 = allEvents.find((e) => e.edition.includes("03") || e.name.includes("2026")) ?? allEvents[0];
  const ev2025 = allEvents.find((e) => e.edition.includes("02") || e.name.includes("2025")) ?? allEvents[0];

  const sampleProducts = [
    {
      slug: "comic-week-2026-oversized-tee-acid-edition",
      name: "Comic Week 2026 Oversized Tee — Acid Cyber Edition",
      description: "T-shirt resmi edisi festival Comic Week 2026. Menggunakan bahan 100% Cotton Heavyweight 24s dengan sablon High-density Plastisol tahan luntur. Potongan oversized modern yang nyaman untuk keliling festival seharian.",
      price: 185000,
      originalPrice: 220000,
      category: "Apparel",
      badge: "Official Festival Merch",
      image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
      buyUrl: "https://tokopedia.com/comicweek/tshirt-2026",
      buyLabel: "Beli di Tokopedia",
      secondaryBuyUrl: "https://wa.me/6281234567890?text=Halo%20Admin%20Comic%20Week%2C%20saya%20ingin%20pesan%20Oversized%20Tee%20Acid%20Cyber%20Edition",
      secondaryBuyLabel: "Pesan via WhatsApp",
      stockStatus: "in_stock",
      eventId: ev2026?.id ?? null,
      featured: true,
      isPublished: true,
    },
    {
      slug: "the-art-of-comic-week-vol-03-hardcover",
      name: "The Art of Comic Week Vol. 03 (Hardcover Archive)",
      description: "Artbook komprehensif setebal 180 halaman full-color yang mengabadikan konsep visual, sketsa karakter, strip eksklusif, serta wawancara mendalam bersama 40+ kreator komik debutan Comic Week 2026.",
      price: 245000,
      originalPrice: 290000,
      category: "Artbook",
      badge: "Limited Edition",
      image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
      buyUrl: "https://shopee.co.id/comicweek/artbook-vol3",
      buyLabel: "Beli di Shopee",
      secondaryBuyUrl: "https://wa.me/6281234567890?text=Halo%20Admin%20Comic%20Week%2C%20saya%20ingin%20pre-order%20Artbook%20Vol%2003",
      secondaryBuyLabel: "Pesan via WhatsApp",
      stockStatus: "pre_order",
      eventId: ev2026?.id ?? null,
      featured: true,
      isPublished: true,
    },
    {
      slug: "neon-ronin-acrylic-keychain-holo-pack",
      name: "Neon Ronin: Akrilik Keychain & Holographic Sticker Pack",
      description: "Gantungan kunci akrilik tebal 4mm bermotif karakter utama 'Neon Ronin' dengan gantungan clasp bintang metalik, disertai 5 lembar stiker vinyl tahan air berefek hologram prisma.",
      price: 45000,
      originalPrice: 55000,
      category: "Aksesoris",
      badge: "Karakter Series",
      image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&auto=format&fit=crop&q=80",
      buyUrl: "https://tokopedia.com/comicweek/neon-ronin-keychain",
      buyLabel: "Beli di Tokopedia",
      secondaryBuyUrl: "https://wa.me/6281234567890?text=Halo%20Admin%20Comic%20Week%2C%20saya%20ingin%20pesan%20Neon%20Ronin%20Keychain%20Pack",
      secondaryBuyLabel: "Pesan via WhatsApp",
      stockStatus: "in_stock",
      eventId: ev2026?.id ?? null,
      featured: false,
      isPublished: true,
    },
    {
      slug: "garuda-archive-metallic-foil-art-print-a2",
      name: "Garuda Archive: Art Print Kolektor A2 (Metallic Gold Foil)",
      description: "Poster cetak seni beresolusi ultra-tinggi ukuran A2 di atas kertas Fancy Textured 280gsm dengan aksen foil emas metalik. Dilengkapi sertifikat keaslian dan nomor seri fisik cetak terbatas (hanya 300 lembar).",
      price: 95000,
      originalPrice: 120000,
      category: "Poster & Art Print",
      badge: "Kolektor Edition",
      image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80",
      buyUrl: "https://shopee.co.id/comicweek/garuda-artprint",
      buyLabel: "Beli di Shopee",
      secondaryBuyUrl: "https://wa.me/6281234567890?text=Halo%20Admin%20Comic%20Week%2C%20saya%20ingin%20pesan%20Garuda%20Archive%20Art%20Print",
      secondaryBuyLabel: "Pesan via WhatsApp",
      stockStatus: "in_stock",
      eventId: ev2026?.id ?? null,
      featured: false,
      isPublished: true,
    },
    {
      slug: "comic-week-2026-vip-festival-boxset",
      name: "KomikWeeks 2026 Ultimate VIP Festival Boxset",
      description: "Kotak koleksi eksklusif edisi KomikWeeks 2026. Berisi Kaos Festival, Hardcover Artbook Vol. 03, ID Card Lanyard Akrilik VIP, 10 Set Kartu Pos Kreator, dan Voucher 1000 Koin Tinta untuk pembacaan komik digital.",
      price: 475000,
      originalPrice: 590000,
      category: "Special Boxset",
      badge: "Event Exclusive",
      image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80",
      buyUrl: "https://tokopedia.com/comicweek/vip-boxset-2026",
      buyLabel: "Beli di Tokopedia",
      secondaryBuyUrl: "https://wa.me/6281234567890?text=Halo%20Admin%20Comic%20Week%2C%20saya%20ingin%20order%20VIP%20Boxset%202026",
      secondaryBuyLabel: "Order via WhatsApp",
      stockStatus: "pre_order",
      eventId: ev2026?.id ?? null,
      featured: true,
      isPublished: true,
    },
    {
      slug: "rasa-nusantara-enamel-pin-culinary-badge",
      name: "Rasa Nusantara: Enamel Pin Koleksi (Set 3 Karakter Kuliner)",
      description: "Koleksi pin enamel logam kuningan timbul dengan warna enamel glossy. Menampilkan maskot kuliner tradisional khas komik Rasa Nusantara.",
      price: 65000,
      originalPrice: 80000,
      category: "Aksesoris",
      badge: "Official Merch",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
      buyUrl: "https://shopee.co.id/comicweek/pin-nusantara",
      buyLabel: "Beli di Shopee",
      secondaryBuyUrl: "https://wa.me/6281234567890?text=Halo%20Admin%20Comic%20Week%2C%20saya%20ingin%20pesan%20Enamel%20Pin%20Rasa%20Nusantara",
      secondaryBuyLabel: "Pesan via WhatsApp",
      stockStatus: "in_stock",
      eventId: ev2025?.id ?? null,
      featured: false,
      isPublished: true,
    },
  ];

  await db.insert(products).values(sampleProducts);
  console.log(`✓ Berhasil menambahkan ${sampleProducts.length} produk katalog sample.`);
}

main().catch((err) => {
  console.error("Gagal sync products:", err);
  process.exit(1);
});
