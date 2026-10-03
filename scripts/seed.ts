import dotenv from "dotenv";
dotenv.config({ path: [".env.local", ".env"] });
import { eq } from "drizzle-orm";
import { db } from "../src/db";
import {
  adminUsers,
  chapters,
  events,
  guests,
  purchases,
  schedules,
  series,
  wallets,
  type PageSlice,
} from "../src/db/schema";
import { hashPassword } from "../src/lib/password";

/* Page-slice geometry computed from the generated art dimensions:
   cover   768x1376 -> 3 slices -> ar 768/458.667, pos 0/50/100
   neon    672x1584 -> 5 slices -> ar 672/316.8,  pos 0/25/50/75/100
   langit  672x1584 -> 5 slices -> same as neon
   rasa    768x1376 -> 4 slices -> ar 768/344,    pos 0/33.33/66.67/100
   garuda  560x1888 -> 6 slices -> ar 560/314.667,pos 0/20/40/60/80/100 */

const slices = (src: string, ar: string, positions: number[]): PageSlice[] =>
  positions.map((pos) => ({ src, ar, pos }));

const coverSlices = (src: string): PageSlice[] =>
  slices(src, "768/458.667", [0, 50, 100]);

async function main() {
  console.log("→ Membersihkan data lama...");
  await db.delete(purchases);
  await db.delete(wallets);
  await db.delete(chapters);
  await db.delete(series);
  await db.delete(schedules);
  await db.delete(guests);
  await db.delete(events);

  console.log("→ Menanam edisi event...");
  await db
    .insert(events)
    .values([
      {
        slug: "comic-week-2024",
        name: "Comic Week 2024",
        edition: "VOL. 01",
        theme: "SUNSET PARADE",
        tagline: "Edisi perdana — saat Jakarta pertama kali berubah jadi kota panel.",
        description:
          "Comic Week lahir tahun 2024 dari sebuah ide nekat: bagaimana kalau komik Indonesia punya festivalnya sendiri — bukan sekadar bazar, melainkan kota kecil tempat kreator, penerbit, dan pembaca bertemu tatap muka. Empat hari di Balai Sarbini, ratusan komikus menggambar langsung, dan untuk pertama kalinya tiga judul orisinal diluncurkan resmi di atas satu panggung. Sunset Parade adalah awal dari tradisi tahunan yang tak pernah berhenti sejak itu.",
        city: "Jakarta",
        venue: "Balai Sarbini & Plaza Festival, Kebayoran Baru",
        startDate: new Date("2024-10-10T10:00:00+07:00"),
        endDate: new Date("2024-10-13T21:00:00+07:00"),
        status: "ended",
        isPublished: true,
        accent: "#FF8A00",
        accent2: "#FF3D81",
        stats: { artists: 160, booths: 240, visitors: 38500, series: 12 },
        tickets: [
          { name: "Harian", price: 49000, label: "Arsip", perks: ["Akses 1 hari penuh", "Artist Alley & Main Stage", "Stiker edisi VOL. 01"] },
          { name: "Full Pass", price: 159000, label: "Arsip", perks: ["Akses 4 hari", "Semua workshop terbuka", "Zine arsip VOL. 01"] },
        ],
      },
      {
        slug: "comic-week-2025",
        name: "Comic Week 2025",
        edition: "VOL. 02",
        theme: "STELLAR ODYSSEY",
        tagline: "Volume dua — ekspansi ke semesta yang jauh lebih besar.",
        description:
          "Tahun kedua, Comic Week pindah ke Jakarta Convention Center dan membawa semangat Stellar Odyssey: komik Indonesia sebagai armada yang siap berlayar ke pasar dunia. Dua puluh delapan judul baru debut, editor dari Jepang dan Spanyol duduk satu meja dengan kreator lokal, dan untuk pertama kalinya perpustakaan digital Comic Week dibuka untuk publik — semua karya yang lahir di panggung festival kini bisa dibaca dan dibuka panel demi panel dari mana saja.",
        city: "Jakarta",
        venue: "Jakarta Convention Center — Hall A & B, Senayan",
        startDate: new Date("2025-11-06T10:00:00+07:00"),
        endDate: new Date("2025-11-09T21:00:00+07:00"),
        status: "ended",
        isPublished: true,
        accent: "#A78BFA",
        accent2: "#34D399",
        stats: { artists: 320, booths: 410, visitors: 72400, series: 28 },
        tickets: [
          { name: "Harian", price: 69000, label: "Arsip", perks: ["Akses 1 hari penuh", "Artist Alley & Main Stage", "Stiker edisi VOL. 02"] },
          { name: "Full Pass", price: 219000, label: "Arsip", perks: ["Akses 4 hari", "Meet & greet terjadwal", "Zine arsip VOL. 02"] },
        ],
      },
      {
        slug: "comic-week-2026",
        name: "Comic Week 2026",
        edition: "VOL. 03",
        theme: "NEO JAKARTA 2099",
        tagline: "Empat hari merayakan masa depan komik Indonesia — dari panel kertas sampai kanvas digital.",
        description:
          "Tahun 2099, Jakarta versi para komikus: kota vertikal yang diterangi hologram, di mana setiap gang punya studio komik dan setiap stasiun punya mural hidup. Comic Week 2026 membawa tema itu turun ke JIExpo Kemayoran selama empat hari penuh — 520 kreator, 680 booth penulis dan penerbit, panggung utama berukuran arena, dan peluncuran resmi judul-judul terbaru yang hanya bisa dibaca pertama kali di perpustakaan digital Comic Week. Semua informasi edisi ini hanya tersedia di microsite ini — bookmark halaman ini dan jangan sampai ketinggalan.",
        city: "Jakarta",
        venue: "JIExpo Kemayoran — Hall B3 & C3",
        startDate: new Date("2026-11-12T12:00:00+07:00"),
        endDate: new Date("2026-11-15T21:00:00+07:00"),
        status: "upcoming",
        isPublished: true,
        accent: "#C9F73A",
        accent2: "#8B5CF6",
        stats: { artists: 520, booths: 680, visitors: 120000, series: 42 },
        tickets: [
          {
            name: "Early Bird",
            price: 89000,
            label: "Terbatas",
            perks: ["Akses 1 hari (bebas pilih)", "Artist Alley + Creator Stage", "Stiker NEO JAKARTA 2099", "Akses antrian reguler"],
          },
          {
            name: "Weekend Pass",
            price: 299000,
            label: "Paling Laris",
            highlight: true,
            perks: ["Akses Sabtu & Minggu", "Semua panggung & workshop", "Zine resmi VOL. 03", "10 Koin Tinta bonus", "Prioritas signing session"],
          },
          {
            name: "VIP Hologram",
            price: 749000,
            label: "Eksklusif 500 kursi",
            perks: ["Akses 4 hari + fast lane", "Kursi depan Main Stage", "Meet & greet 6 guest star", "Merch bundle + artbook", "50 Koin Tinta bonus", "Sesi foto after-party"],
          },
        ],
      },
    ]);

  // Lookup by slug — do NOT rely on INSERT ... RETURNING row order.
  const eventRows = await db.select().from(events);
  const evBySlug = new Map(eventRows.map((e) => [e.slug, e]));
  const ev2024 = evBySlug.get("comic-week-2024")!;
  const ev2025 = evBySlug.get("comic-week-2025")!;
  const ev2026 = evBySlug.get("comic-week-2026")!;

  console.log("→ Menanam guest star...");
  await db.insert(guests).values([
    { eventId: ev2026.id, name: "Aya Kirana", role: "Mangaka — Rasa Nusantara", origin: "Yogyakarta, ID", color: "#FF8A00", bio: "Penulis dapur ajaib yang membawa rempah Nusantara ke panggung fantasi dunia. Panelnya pernah bikin satu hall antre demi mencium aroma gulai." },
    { eventId: ev2026.id, name: "Bimo Aditya", role: "Kreator — Neon Ronin", origin: "Jakarta, ID", color: "#35E0FF", bio: "Arsitek kota distopia NEO Jakarta. Menggambar 18 jam sehari, sisanya tidur di meja gambar." },
    { eventId: ev2026.id, name: "Sinta Maharani", role: "Ilustrator — Langit Kertas", origin: "Bandung, ID", color: "#F7A8D8", bio: "Ratu romance slice-of-life. Karyanya dipercaya menguapkan 40.000 toner pastel per tahun." },
    { eventId: ev2026.id, name: "Raka Pradana", role: "Studio Arka — Garuda Archive", origin: "Surabaya, ID", color: "#FFD23F", bio: "Insinyur mesin & mitologi. Mecha Garuda-nya menggabungkan relief candi dengan kinematics sungguhan." },
    { eventId: ev2026.id, name: "Kenji Mori", role: "Editor — Weekly Alpha (JP)", origin: "Tokyo, JP", color: "#8B5CF6", bio: "Editor serial aksi ternama Tokyo, berburu bakat Asia Tenggara dan jatuh cinta pada kopi tubruk." },
    { eventId: ev2026.id, name: "Lucía Fernández", role: "Colorist & Art Director", origin: "Barcelona, ES", color: "#34D399", bio: "Spesialis palet untuk 30+ judul Eropa. Akan mengajar masterclass pewarnaan digital selama 3 jam." },
    { eventId: ev2025.id, name: "Aya Kirana", role: "Mangaka — Rasa Nusantara", origin: "Yogyakarta, ID", color: "#FF8A00", bio: "Debut Rasa Nusantara jilid pertama habis dalam 2 jam." },
    { eventId: ev2025.id, name: "Sinta Maharani", role: "Ilustrator — Langit Kertas", origin: "Bandung, ID", color: "#F7A8D8", bio: "Langit Kertas debut di panggung Comic Week 2025." },
    { eventId: ev2025.id, name: "Kenji Mori", role: "Editor Tamu", origin: "Tokyo, JP", color: "#8B5CF6", bio: "Membuka sesi portfolio review pertama Comic Week." },
    { eventId: ev2025.id, name: "Dhika Prameswari", role: "Komikus — Kopi & Karton", origin: "Malang, ID", color: "#C98A5E", bio: "Spesialis komik kucing dan kafe kardus." },
    { eventId: ev2024.id, name: "Naufal Rizqi", role: "Komikus Horor", origin: "Solo, ID", color: "#6EE7B7", bio: "Otak di balik Kelasku Sekolah Hantu." },
    { eventId: ev2024.id, name: "Dhika Prameswari", role: "Komikus — Kopi & Karton", origin: "Malang, ID", color: "#C98A5E", bio: "Debut strip komedi Kopi & Karton." },
    { eventId: ev2024.id, name: "Tania Wijaya", role: "Kurator Artist Alley", origin: "Jakarta, ID", color: "#FF4D00", bio: "Mengkurasi 160 seniman edisi perdana." },
  ]);

  console.log("→ Menanam jadwal...");
  await db.insert(schedules).values([
    // 2026 — Day 1
    { eventId: ev2026.id, day: 1, dateLabel: "Kamis, 12 Nov 2026", time: "12:00", title: "Opening Ceremony — Gerbang NEO JAKARTA 2099", stage: "Main Stage", kind: "ceremony" },
    { eventId: ev2026.id, day: 1, dateLabel: "Kamis, 12 Nov 2026", time: "13:30", title: "Neon Ronin: Membangun Kota Masa Depan", stage: "Creator Stage", kind: "talk" },
    { eventId: ev2026.id, day: 1, dateLabel: "Kamis, 12 Nov 2026", time: "15:00", title: "Workshop: Anatomi Panel Vertikal Webtoon", stage: "Workshop Hall", kind: "workshop" },
    { eventId: ev2026.id, day: 1, dateLabel: "Kamis, 12 Nov 2026", time: "17:00", title: "Meet & Greet — Aya Kirana", stage: "Artist Alley", kind: "signing" },
    { eventId: ev2026.id, day: 1, dateLabel: "Kamis, 12 Nov 2026", time: "19:30", title: "Grand Coswalk National — Babak Final", stage: "Main Stage", kind: "show" },
    // 2026 — Day 2
    { eventId: ev2026.id, day: 2, dateLabel: "Jumat, 13 Nov 2026", time: "10:00", title: "Portfolio Review bersama Kenji Mori", stage: "Workshop Hall", kind: "workshop" },
    { eventId: ev2026.id, day: 2, dateLabel: "Jumat, 13 Nov 2026", time: "12:00", title: "Dari Dapur ke Dunia Fantasi — Aya Kirana", stage: "Creator Stage", kind: "talk" },
    { eventId: ev2026.id, day: 2, dateLabel: "Jumat, 13 Nov 2026", time: "14:00", title: "Live Drawing: Bimo Aditya menggambar Sektor 9", stage: "Main Stage", kind: "show" },
    { eventId: ev2026.id, day: 2, dateLabel: "Jumat, 13 Nov 2026", time: "16:00", title: "Talkshow: Komik Indonesia Tembus Pasar Global", stage: "Creator Stage", kind: "talk" },
    { eventId: ev2026.id, day: 2, dateLabel: "Jumat, 13 Nov 2026", time: "19:00", title: "Garuda Archive — Premiere Teaser Animasi", stage: "Main Stage", kind: "screening" },
    // 2026 — Day 3
    { eventId: ev2026.id, day: 3, dateLabel: "Sabtu, 14 Nov 2026", time: "10:00", title: "Briefing Kompetisi Komik 24 Jam", stage: "Workshop Hall", kind: "competition" },
    { eventId: ev2026.id, day: 3, dateLabel: "Sabtu, 14 Nov 2026", time: "13:00", title: "Signing Session — Sinta Maharani", stage: "Artist Alley", kind: "signing" },
    { eventId: ev2026.id, day: 3, dateLabel: "Sabtu, 14 Nov 2026", time: "15:00", title: "Masterclass Pewarnaan Digital — Lucía Fernández", stage: "Workshop Hall", kind: "workshop" },
    { eventId: ev2026.id, day: 3, dateLabel: "Sabtu, 14 Nov 2026", time: "17:00", title: "Artist Alley Grand Tour + Stamp Rally", stage: "Artist Alley", kind: "show" },
    { eventId: ev2026.id, day: 3, dateLabel: "Sabtu, 14 Nov 2026", time: "19:30", title: "Konser Anisong & OST Komik", stage: "Main Stage", kind: "show" },
    // 2026 — Day 4
    { eventId: ev2026.id, day: 4, dateLabel: "Minggu, 15 Nov 2026", time: "11:00", title: "Pengumuman Kompetisi Komik 24 Jam", stage: "Main Stage", kind: "ceremony" },
    { eventId: ev2026.id, day: 4, dateLabel: "Minggu, 15 Nov 2026", time: "13:00", title: "Panel: Masa Depan Komik Digital Indonesia", stage: "Creator Stage", kind: "talk" },
    { eventId: ev2026.id, day: 4, dateLabel: "Minggu, 15 Nov 2026", time: "15:00", title: "Comic Week Community Awards", stage: "Main Stage", kind: "ceremony" },
    { eventId: ev2026.id, day: 4, dateLabel: "Minggu, 15 Nov 2026", time: "17:00", title: "Closing — Teaser Comic Week 2027", stage: "Main Stage", kind: "ceremony" },
    // 2025 sample
    { eventId: ev2025.id, day: 1, dateLabel: "Kamis, 6 Nov 2025", time: "12:00", title: "Opening — Peluncuran Armada Stellar", stage: "Main Stage", kind: "ceremony" },
    { eventId: ev2025.id, day: 1, dateLabel: "Kamis, 6 Nov 2025", time: "14:00", title: "Debut Rasa Nusantara — Live Cooking Panel", stage: "Creator Stage", kind: "show" },
    { eventId: ev2025.id, day: 2, dateLabel: "Jumat, 7 Nov 2025", time: "13:00", title: "Portfolio Review — Kenji Mori", stage: "Workshop Hall", kind: "workshop" },
    { eventId: ev2025.id, day: 2, dateLabel: "Jumat, 7 Nov 2025", time: "16:00", title: "Langit Kertas: Seni Menguapkan Perasaan", stage: "Creator Stage", kind: "talk" },
    { eventId: ev2025.id, day: 3, dateLabel: "Sabtu, 8 Nov 2025", time: "11:00", title: "Kompetisi Komik 24 Jam", stage: "Workshop Hall", kind: "competition" },
    { eventId: ev2025.id, day: 4, dateLabel: "Minggu, 9 Nov 2025", time: "16:00", title: "Closing & Perpustakaan Digital Dibuka", stage: "Main Stage", kind: "ceremony" },
    // 2024 sample
    { eventId: ev2024.id, day: 1, dateLabel: "Kamis, 10 Okt 2024", time: "12:00", title: "Opening — Sunset Parade Dimulai", stage: "Main Stage", kind: "ceremony" },
    { eventId: ev2024.id, day: 1, dateLabel: "Kamis, 10 Okt 2024", time: "15:00", title: "Debut Strip Kopi & Karton", stage: "Creator Stage", kind: "show" },
    { eventId: ev2024.id, day: 2, dateLabel: "Jumat, 11 Okt 2024", time: "13:00", title: "Horor di Koridor: Naufal Rizqi Bercerita", stage: "Creator Stage", kind: "talk" },
    { eventId: ev2024.id, day: 3, dateLabel: "Sabtu, 12 Okt 2024", time: "14:00", title: "Artist Alley Stamp Rally", stage: "Artist Alley", kind: "show" },
    { eventId: ev2024.id, day: 4, dateLabel: "Minggu, 13 Okt 2024", time: "17:00", title: "Closing — Sampai Jumpa di VOL. 02", stage: "Main Stage", kind: "ceremony" },
  ]);

  console.log("→ Menanam seri komik...");
  await db
    .insert(series)
    .values([
      {
        slug: "neon-ronin",
        title: "Neon Ronin",
        author: "Bimo Aditya",
        genres: ["Aksi", "Sci-Fi", "Cyberpunk"],
        synopsis:
          "Tahun 2099, NEO JAKARTA dipotong menjadi 12 sektor oleh korporasi hologram. Rona — ronin terakhir dari klan tinta — berkeliling kota dengan katana peninggalan ayahnya, memburu arsip digital yang bisa membongkar siapa yang menghapus seluruh sektor 9 dari peta... dan dari ingatan warganya.",
        status: "ongoing",
        rating: 9.8,
        views: 1250400,
        likes: 84200,
        coverImage: "/covers/neon-ronin.jpg",
        featured: true,
        releaseDay: "Sabtu",
        eventId: ev2026.id,
      },
      {
        slug: "garuda-archive",
        title: "Garuda Archive",
        author: "Studio Arka",
        genres: ["Mecha", "Aksi", "Mitologi"],
        synopsis:
          "Di bawah Candi Borobudur tersimpan Arsip Garuda: mesin raksasa era peradaban kuno yang hanya bangkit saat langit retak. Kirana, pilot muda dari akademi angkasa, menemukan bahwa mesin itu bukan senjata — melainkan perpustakaan terbang yang menyimpan ingatan seluruh Nusantara.",
        status: "ongoing",
        rating: 9.7,
        views: 656300,
        likes: 52800,
        coverImage: "/covers/garuda-archive.jpg",
        featured: true,
        releaseDay: "Rabu",
        eventId: ev2026.id,
      },
      {
        slug: "rasa-nusantara",
        title: "Rasa Nusantara",
        author: "Aya Kirana",
        genres: ["Fantasi", "Kuliner", "Drama"],
        synopsis:
          "Sari mewarisi warung tua neneknya beserta satu buku resep yang berbisik. Setiap hidangan yang ia masak membuka pintu ke dunia rempah — tempat para penjaga rasa bertarung menjaga keseimbangan. Demi menyelamatkan warung dan ingatan neneknya, Sari harus memenangkan Sayembara Seribu Sambal.",
        status: "ongoing",
        rating: 9.6,
        views: 986700,
        likes: 71500,
        coverImage: "/covers/rasa-nusantara.jpg",
        featured: true,
        releaseDay: "Minggu",
        eventId: ev2025.id,
      },
      {
        slug: "langit-kertas",
        title: "Langit Kertas",
        author: "Sinta Maharani",
        genres: ["Romansa", "Slice of Life", "Sekolah"],
        synopsis:
          "Tio melipat pesan untuk ayahnya yang bekerja di kota lain menjadi pesawat kertas — dan melemparnya dari atap sekolah setiap sore. Suatu hari, salah satu pesawat kembali dengan tulisan tangan yang tidak ia kenal. Dua kota, dua atap, satu langit kertas.",
        status: "ongoing",
        rating: 9.4,
        views: 743200,
        likes: 66900,
        coverImage: "/covers/langit-kertas.jpg",
        featured: false,
        releaseDay: "Jumat",
        eventId: ev2025.id,
      },
      {
        slug: "kopi-karton",
        title: "Kopi & Karton",
        author: "Dhika Prameswari",
        genres: ["Komedi", "Hewan", "Slice of Life"],
        synopsis:
          "Bono, kucing oranye mantan juara tidur nasional, terpaksa jadi barista karena tuannya membuka kafe di dalam kardus bekas. Setiap hari adalah pelanggan baru yang aneh: tikus kritikus kopi, merpati influencer, sampai bos besar — anjing tetangga.",
        status: "upcoming",
        rating: 9.1,
        views: 210400,
        likes: 19800,
        coverImage: "/covers/kopi-karton.jpg",
        featured: false,
        eventId: ev2024.id,
      },
      {
        slug: "kelasku-sekolah-hantu",
        title: "Kelasku, Sekolah Hantu",
        author: "Naufal Rizqi",
        genres: ["Horor", "Misteri", "Thriller"],
        synopsis:
          "Kelas XI-4 punya satu bangku kosong yang tidak pernah boleh diisi. Saat murid pindahan Sasa melanggar aturan tak tertulis itu, jam digital sekolah berhenti di pukul 11.54 — dan lorong lantai dua mulai menghitung siapa saja yang pernah duduk di sana.",
        status: "upcoming",
        rating: 8.9,
        views: 180900,
        likes: 15400,
        coverImage: "/covers/sekolah-hantu.jpg",
        featured: false,
        eventId: ev2024.id,
      },
    ]);

  // Lookup by slug — do NOT rely on INSERT ... RETURNING row order.
  const seriesRows = await db.select().from(series);
  const bySlug = new Map(seriesRows.map((s) => [s.slug, s]));
  const neonRonin = bySlug.get("neon-ronin")!;
  const rasa = bySlug.get("rasa-nusantara")!;
  const langit = bySlug.get("langit-kertas")!;
  const garuda = bySlug.get("garuda-archive")!;

  console.log("→ Menanam chapter...");
  const NEON = "/strips/neon-ronin-strip.jpg";
  const RASA = "/strips/rasa-strip.jpg";
  const LANGIT = "/strips/langit-strip.jpg";
  const GARUDA = "/strips/garuda-strip.jpg";

  await db.insert(chapters).values([
    // Neon Ronin — strip 672x1584, 5 slices
    { seriesId: neonRonin.id, number: 1, title: "Hujan di Sektor 9", publishedAt: new Date("2026-05-02T10:00:00+07:00"), isFree: true, priceCoins: 0, isPublished: true, pages: slices(NEON, "672/316.8", [0, 25, 50]) },
    { seriesId: neonRonin.id, number: 2, title: "Pedang Kedua", publishedAt: new Date("2026-05-09T10:00:00+07:00"), isFree: false, priceCoins: 30, isPublished: true, pages: slices(NEON, "672/316.8", [75, 100]) },
    { seriesId: neonRonin.id, number: 3, title: "Bonus: Draft Pertama Rona", publishedAt: new Date("2026-05-16T10:00:00+07:00"), isFree: false, priceCoins: 45, isPublished: true, pages: coverSlices("/covers/neon-ronin.jpg") },
    { seriesId: neonRonin.id, number: 4, title: "Sektor 0", publishedAt: new Date("2026-12-19T10:00:00+07:00"), isFree: false, priceCoins: 30, isPublished: false, pages: [] },
    // Garuda Archive — strip 560x1888, 6 slices
    { seriesId: garuda.id, number: 1, title: "Langit yang Retak", publishedAt: new Date("2026-04-22T10:00:00+07:00"), isFree: true, priceCoins: 0, isPublished: true, pages: slices(GARUDA, "560/314.667", [0, 20, 40]) },
    { seriesId: garuda.id, number: 2, title: "Protokol Garuda", publishedAt: new Date("2026-04-29T10:00:00+07:00"), isFree: false, priceCoins: 30, isPublished: true, pages: slices(GARUDA, "560/314.667", [60, 80, 100]) },
    { seriesId: garuda.id, number: 3, title: "Bonus: Sketsa Mesin Arsip", publishedAt: new Date("2026-05-06T10:00:00+07:00"), isFree: false, priceCoins: 45, isPublished: true, pages: coverSlices("/covers/garuda-archive.jpg") },
    { seriesId: garuda.id, number: 4, title: "Kota di Bawah Candi", publishedAt: new Date("2026-12-16T10:00:00+07:00"), isFree: false, priceCoins: 30, isPublished: false, pages: [] },
    // Rasa Nusantara — strip 768x1376, 4 slices
    { seriesId: rasa.id, number: 1, title: "Warung yang Berbisik", publishedAt: new Date("2025-11-15T10:00:00+07:00"), isFree: true, priceCoins: 0, isPublished: true, pages: slices(RASA, "768/344", [0, 33.3333]) },
    { seriesId: rasa.id, number: 2, title: "Sayembara Seribu Sambal", publishedAt: new Date("2025-11-22T10:00:00+07:00"), isFree: false, priceCoins: 30, isPublished: true, pages: slices(RASA, "768/344", [66.6667, 100]) },
    { seriesId: rasa.id, number: 3, title: "Bonus: Resep Rahasia Nenek", publishedAt: new Date("2025-11-29T10:00:00+07:00"), isFree: false, priceCoins: 45, isPublished: true, pages: coverSlices("/covers/rasa-nusantara.jpg") },
    { seriesId: rasa.id, number: 4, title: "Penjaga Rasa Ketujuh", publishedAt: new Date("2026-12-13T10:00:00+07:00"), isFree: false, priceCoins: 30, isPublished: false, pages: [] },
    // Langit Kertas — strip 672x1584, 5 slices
    { seriesId: langit.id, number: 1, title: "Sore di Atap Sekolah", publishedAt: new Date("2025-11-21T10:00:00+07:00"), isFree: true, priceCoins: 0, isPublished: true, pages: slices(LANGIT, "672/316.8", [0, 25, 50]) },
    { seriesId: langit.id, number: 2, title: "Tulisan Tangan Asing", publishedAt: new Date("2025-11-28T10:00:00+07:00"), isFree: false, priceCoins: 30, isPublished: true, pages: slices(LANGIT, "672/316.8", [75, 100]) },
    { seriesId: langit.id, number: 3, title: "Bonus: Lipatan Pertama", publishedAt: new Date("2025-12-05T10:00:00+07:00"), isFree: false, priceCoins: 45, isPublished: true, pages: coverSlices("/covers/langit-kertas.jpg") },
    { seriesId: langit.id, number: 4, title: "Kota di Ujung Langit", publishedAt: new Date("2026-12-18T10:00:00+07:00"), isFree: false, priceCoins: 30, isPublished: false, pages: [] },
  ]);

  // Pastikan akun admin tersedia (idempotent — tidak menimpa yang sudah ada)
  const adminUsername = process.env.ADMIN_USERNAME ?? "admin";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "comicweek123";
  const [existingAdmin] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.username, adminUsername))
    .limit(1);
  if (!existingAdmin) {
    await db.insert(adminUsers).values({
      username: adminUsername,
      passwordHash: hashPassword(adminPassword),
      displayName: "Redaksi Comic Week",
    });
    console.log(`✓ Akun admin dibuat: ${adminUsername}`);
  }

  console.log("✓ Seed selesai!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed gagal:", err);
  process.exit(1);
});
