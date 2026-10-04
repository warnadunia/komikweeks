export const POST_CATEGORIES = [
  { value: "general", label: "General / Portal Umum" },
  { value: "kegiatan", label: "Kegiatan & Jadwal Event" },
  { value: "pengumuman", label: "Pengumuman Resmi" },
  { value: "liputan", label: "Liputan & Dokumentasi" },
  { value: "wawancara", label: "Wawancara & Profil" },
  { value: "komunitas", label: "Komunitas & Fan Art" },
] as const;

export type PostCategory = (typeof POST_CATEGORIES)[number]["value"];
