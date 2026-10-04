import dotenv from "dotenv";
dotenv.config({ path: [".env.local", ".env"] });
import { eq } from "drizzle-orm";

async function main() {
  const { db } = await import("../src/db");
  const { events, posts } = await import("../src/db/schema");

  console.log("DATABASE_URL is:", process.env.DATABASE_URL ? "Loaded from env" : "NOT LOADED!");

  console.log("→ Mencari event Comic Week 2026...");
  const [cw2026] = await db
    .select()
    .from(events)
    .where(eq(events.slug, "comic-week-2026"))
    .limit(1);

  console.log("Event 2026 found:", cw2026 ? `${cw2026.name} (${cw2026.id})` : "Not found");

  const samplePosts = [
    {
      slug: "selamat-datang-di-portal-resmi-comic-week",
      title: "Selamat Datang di Portal Resmi Comic Week: Rumah Baru Komik Orisinal Indonesia",
      category: "Pengumuman",
      author: "Redaksi Comic Week",
      coverImage: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80",
      excerpt: "Mulai hari ini, seluruh karya debut, tiket festival, pembacaan komik vertikal, dan warta kegiatan resmi Comic Week terintegrasi penuh dalam satu platform digital.",
      content: `Selamat datang di **Portal Resmi Comic Week Indonesia**!

Sejak edisi pertama kami pada tahun 2024 di Balai Sarbini, Comic Week telah tumbuh dari sekadar pertemuan akhir pekan menjadi ekosistem festival komik tahunan terbesar di tanah air. 

Hari ini, kami bangga merilis platform digital resmi ini yang mempertemukan:

1. **Reader Komik Vertikal Modern**: Nikmati komik-komik orisinal debutan festival langsung dari layar ponsel atau komputer Anda dengan sistem koin tinta dan navigasi panel responsif.
2. **Microsite Resmi Setiap Edisi**: Jelajahi jadwal panggung, profil bintang tamu, dan tiket masuk dari edisi masa lalu hingga edisi mendatang.
3. **Warta & Berita Kegiatan**: Ruang redaksi tempat Anda dapat mengikuti update terkini seputar industri, pameran seni, workshop, dan rilis komik baru.

![Suasana Festival Comic Week](https://images.unsplash.com/photo-1544717305-2782549b5136?w=1200&auto=format&fit=crop&q=80)

### Apa yang Akan Datang?
Kami sedang menyiapkan serangkaian kejutan untuk menyambut edisi festival tahun ini di JIEXPO Kemayoran. Jangan lewatkan kesempatan untuk mengklaim **100 Koin Tinta Selamat Datang** Anda di bilah navigasi atas dan mulailah membaca bab perdana secara gratis!

Salam hangat,  
*Redaksi Comic Week Festival*`,
      eventId: null, // Portal General
      isPublished: true,
      publishedAt: new Date(),
    },
    {
      slug: "open-submission-artist-alley-cw2026",
      title: "Open Submission Artist Alley Comic Week 2026 Resmi Dibuka: Waktunya Karyamu Beraksi!",
      category: "Kegiatan",
      author: "Kurasi Festival",
      coverImage: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=1200&auto=format&fit=crop&q=80",
      excerpt: "Pendaftaran booth komikus mandiri, art collective, dan kreator debutan untuk panggung Neon Cyber Jakarta kini telah resmi dibuka. Simak syarat kurasi dan tenggat waktunya di sini.",
      content: `Panggilan terbuka untuk seluruh komikus, ilustrator, dan kreator indie di seluruh pelosok nusantara!

**Comic Week 2026 (Vol. 03: Neon Cyber)** resmi membuka pendaftaran meja kreator untuk zona **Artist Alley & Debut Pavillion**. Tahun ini, kami menyediakan lebih dari 120 slot booth mandiri dengan fasilitas pajang karya dan display interaktif.

![Meja Kreator Artist Alley](https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1200&auto=format&fit=crop&q=80)

### Kategori Booth yang Dibuka:
- **Indie Comic Creators**: Khusus kreator yang menerbitkan zine komik fisik, doujinshi orisinal, atau komik cetak mandiri.
- **Illustration & Merch Collective**: Untuk art print, gantungan kunci akrilik, stiker eksklusif festival, dan apparel ilustrasi.
- **Digital Debut Showcase**: Slot terkurasi di mana komik Anda akan diikutsertakan dalam katalog digital Comic Week.

### Jadwal Penting:
1. **Batas Akhir Pengiriman Portofolio**: 15 Oktober 2026
2. **Pengumuman Kurasi**: 25 Oktober 2026
3. **Technical Meeting & Plotting Booth**: 5 November 2026
4. **Hari-H Festival**: 20-22 November 2026 (JIEXPO Kemayoran Hall B)

Pastikan portofolio Anda siap dan jangan tunda hingga hari terakhir karena kuota kurasi sangat terbatas!`,
      eventId: cw2026?.id ?? null,
      isPublished: true,
      publishedAt: new Date(),
    },
    {
      slug: "bocoran-masterclass-live-drawing-cw2026",
      title: "Bocoran Sesi Masterclass & Live Drawing Bareng Komikus Legendaris di Panggung Utama",
      category: "Wawancara",
      author: "Tim Acara",
      coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
      excerpt: "Dari bedah anatomi dinamis bersama Master Rendy hingga workshop storytelling webtoon intensif, ini daftar workshop eksklusif yang siap menyambutmu di JIEXPO Kemayoran.",
      content: `Tahun ini, panggung edukasi dan transfer ilmu Comic Week 2026 akan hadir dengan format yang lebih mendalam dan interaktif.

Kami telah merancang 3 sesi **Masterclass Terbuka** yang dapat diikuti oleh seluruh pemegang tiket reguler maupun All-Access Pass:

### 1. Panel & Anatomi Dinamis: Dari Sketsa Kasar Menjadi Adegan Aksi
Dipandu langsung oleh **Rendy 'Gouki' Pratama**, pencipta komik laga sci-fi *Neon Ronin*. Di sesi ini, peserta akan diajak membedah bagaimana menciptakan efek kinetik dan perspektif dramatis hanya dengan garis tinta tajam.

![Sesi Menggambar Komik](https://images.unsplash.com/photo-1580927752452-89d86da3fa0a?w=1200&auto=format&fit=crop&q=80)

### 2. Storytelling Vertikal untuk Webtoon & Digital Comic
Belajar bagaimana merancang ritme baca scrolling yang bikin pembaca enggan berhenti scroll. Sesi ini membongkar cara pacing panel, penempatan cliffhanger di ujung layar ponsel, dan pemilihan palet warna emosional.

### 3. Live Drawing Battle: 30 Menit, 1 Tema Misterius
Tantangan langsung di layar panggung raksasa antara 4 ilustrator papan atas Indonesia dengan input tema langsung dari voting penonton festival!

Sampai jumpa di depan panggung utama Comic Week 2026!`,
      eventId: cw2026?.id ?? null,
      isPublished: true,
      publishedAt: new Date(),
    },
  ];

  console.log("→ Menyimpan sample blog posts...");
  for (const post of samplePosts) {
    const [existing] = await db
      .select()
      .from(posts)
      .where(eq(posts.slug, post.slug))
      .limit(1);

    if (existing) {
      await db.update(posts).set(post).where(eq(posts.id, existing.id));
      console.log(`✓ Diperbarui: ${post.title}`);
    } else {
      await db.insert(posts).values(post);
      console.log(`✓ Ditambahkan: ${post.title}`);
    }
  }

  console.log("✓ Selesai seeding sample blog posts!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Gagal seeding posts:", err);
  process.exit(1);
});
