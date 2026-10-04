"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import {
  adminUsers,
  chapters,
  events,
  guests,
  schedules,
  series,
  posts,
  type PageSlice,
  type TicketTier,
} from "@/db/schema";
import { clearAdminSession, requireAdminForAction, setAdminSession } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { parseWIB } from "@/lib/utils";

export type FormState = { ok: boolean; message: string } | null;

function ok(message: string): FormState {
  return { ok: true, message };
}
function fail(message: string): FormState {
  return { ok: false, message };
}

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const num = (fd: FormData, key: string, fallback = 0) => {
  const n = Number(fd.get(key));
  return Number.isFinite(n) ? n : fallback;
};
const checked = (fd: FormData, key: string) => fd.get(key) === "on";

function isUniqueViolation(e: unknown): boolean {
  return typeof e === "object" && e !== null && "code" in e && (e as { code?: string }).code === "23505";
}

async function guard(): Promise<FormState | null> {
  const user = await requireAdminForAction();
  if (!user) return fail("Sesi berakhir — silakan masuk kembali.");
  return null;
}

/* ---------------------------------- auth ---------------------------------- */

export async function loginAdmin(_prev: FormState, fd: FormData): Promise<FormState> {
  const username = str(fd, "username");
  const password = str(fd, "password");
  if (!username || !password) return fail("Isi username dan password.");

  const [user] = await db.select().from(adminUsers).where(eq(adminUsers.username, username)).limit(1);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return fail("Username atau password salah.");
  }
  await setAdminSession(user.id);
  redirect("/admin");
}

export async function logoutAdmin() {
  await clearAdminSession();
  redirect("/admin/login");
}

/* --------------------------------- events --------------------------------- */

export async function upsertEvent(_prev: FormState, fd: FormData): Promise<FormState> {
  const denied = await guard();
  if (denied) return denied;

  const id = num(fd, "id") || null;
  const slug = str(fd, "slug")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-");
  const startDate = parseWIB(str(fd, "startDate"));
  const endDate = parseWIB(str(fd, "endDate"));
  if (!slug) return fail("Slug wajib diisi (huruf kecil, angka, strip).");
  if (!startDate || !endDate) return fail("Tanggal mulai/selesai tidak valid.");
  if (endDate <= startDate) return fail("Tanggal selesai harus setelah tanggal mulai.");

  let tickets: TicketTier[] = [];
  try {
    tickets = JSON.parse(str(fd, "tickets") || "[]");
    if (!Array.isArray(tickets)) throw new Error("bad");
    tickets = tickets.map((t) => ({
      name: String(t.name ?? "").trim(),
      price: Number(t.price) || 0,
      label: t.label ? String(t.label) : undefined,
      highlight: !!t.highlight,
      perks: Array.isArray(t.perks) ? t.perks.map(String).filter(Boolean) : [],
    })).filter((t) => t.name);
  } catch {
    return fail("Data tiket tidak valid.");
  }

  const statusRaw = str(fd, "status");
  const status = (["upcoming", "live", "ended"] as const).includes(statusRaw as never)
    ? (statusRaw as "upcoming" | "live" | "ended")
    : "upcoming";

  const values = {
    slug,
    name: str(fd, "name"),
    edition: str(fd, "edition"),
    theme: str(fd, "theme"),
    tagline: str(fd, "tagline") || null,
    description: str(fd, "description") || null,
    city: str(fd, "city") || null,
    venue: str(fd, "venue") || null,
    startDate,
    endDate,
    status,
    isPublished: checked(fd, "published"),
    accent: str(fd, "accent") || "#C9F73A",
    accent2: str(fd, "accent2") || "#8B5CF6",
    stats: {
      artists: num(fd, "statArtists"),
      booths: num(fd, "statBooths"),
      visitors: num(fd, "statVisitors"),
      series: num(fd, "statSeries"),
    },
    tickets,
  };
  if (!values.name) return fail("Nama event wajib diisi.");

  try {
    if (id) {
      await db.update(events).set(values).where(eq(events.id, id));
    } else {
      const [created] = await db.insert(events).values(values).returning({ id: events.id });
      revalidatePath("/");
      redirect(`/admin/events/${created.id}`);
    }
  } catch (e) {
    if (isUniqueViolation(e)) return fail(`Slug "${slug}" sudah dipakai edisi lain.`);
    if (e instanceof Error && e.message === "NEXT_REDIRECT") throw e;
    throw e;
  }
  revalidatePath("/");
  return ok("Edisi tersimpan.");
}

export async function deleteEvent(id: number) {
  const denied = await guard();
  if (denied) return denied;
  await db.delete(events).where(eq(events.id, id));
  revalidatePath("/");
  return ok("Edisi beserta jadwal & guest star-nya dihapus.");
}

/* -------------------------------- schedules ------------------------------- */

export async function upsertSchedule(_prev: FormState, fd: FormData): Promise<FormState> {
  const denied = await guard();
  if (denied) return denied;
  const id = num(fd, "id") || null;
  const eventId = num(fd, "eventId");
  if (!eventId) return fail("Event tidak valid.");
  const values = {
    eventId,
    day: Math.max(1, num(fd, "day", 1)),
    dateLabel: str(fd, "dateLabel"),
    time: str(fd, "time"),
    title: str(fd, "title"),
    stage: str(fd, "stage"),
    kind: str(fd, "kind") || "talk",
  };
  if (!values.title) return fail("Judul agenda wajib diisi.");
  if (id) await db.update(schedules).set(values).where(eq(schedules.id, id));
  else await db.insert(schedules).values(values);
  return ok(id ? "Agenda diperbarui." : "Agenda ditambahkan.");
}

export async function deleteSchedule(id: number) {
  const denied = await guard();
  if (denied) return denied;
  await db.delete(schedules).where(eq(schedules.id, id));
  return ok("Agenda dihapus.");
}

/* ---------------------------------- guests --------------------------------- */

export async function upsertGuest(_prev: FormState, fd: FormData): Promise<FormState> {
  const denied = await guard();
  if (denied) return denied;
  const id = num(fd, "id") || null;
  const eventId = num(fd, "eventId");
  if (!eventId) return fail("Event tidak valid.");
  const values = {
    eventId,
    name: str(fd, "name"),
    role: str(fd, "role"),
    origin: str(fd, "origin") || "Indonesia",
    bio: str(fd, "bio") || null,
    color: str(fd, "color") || "#FF4D00",
  };
  if (!values.name) return fail("Nama guest wajib diisi.");
  if (id) await db.update(guests).set(values).where(eq(guests.id, id));
  else await db.insert(guests).values(values);
  return ok(id ? "Guest diperbarui." : "Guest ditambahkan.");
}

export async function deleteGuest(id: number) {
  const denied = await guard();
  if (denied) return denied;
  await db.delete(guests).where(eq(guests.id, id));
  return ok("Guest dihapus.");
}

/* ---------------------------------- series --------------------------------- */

export async function upsertSeries(_prev: FormState, fd: FormData): Promise<FormState> {
  const denied = await guard();
  if (denied) return denied;

  const id = num(fd, "id") || null;
  const slug = str(fd, "slug")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-");
  if (!slug) return fail("Slug wajib diisi.");
  const genres = str(fd, "genres")
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean);
  if (genres.length === 0) return fail("Isi minimal satu genre (pisahkan dengan koma).");

  const eventIdRaw = str(fd, "eventId");
  const values = {
    slug,
    title: str(fd, "title"),
    author: str(fd, "author"),
    genres,
    synopsis: str(fd, "synopsis"),
    status: ["ongoing", "upcoming", "completed"].includes(str(fd, "status"))
      ? str(fd, "status")
      : "ongoing",
    rating: Math.min(10, Math.max(0, num(fd, "rating"))),
    views: num(fd, "views"),
    likes: num(fd, "likes"),
    coverImage: str(fd, "coverImage") || "/covers/neon-ronin.jpg",
    featured: checked(fd, "featured"),
    releaseDay: str(fd, "releaseDay") || null,
    eventId: eventIdRaw === "none" || !eventIdRaw ? null : num(fd, "eventId") || null,
  };
  if (!values.title) return fail("Judul seri wajib diisi.");
  if (!values.synopsis) return fail("Sinopsis wajib diisi.");

  try {
    if (id) {
      await db.update(series).set(values).where(eq(series.id, id));
    } else {
      const [created] = await db.insert(series).values(values).returning({ id: series.id });
      revalidatePath("/");
      redirect(`/admin/series/${created.id}`);
    }
  } catch (e) {
    if (isUniqueViolation(e)) return fail(`Slug "${slug}" sudah dipakai seri lain.`);
    if (e instanceof Error && e.message === "NEXT_REDIRECT") throw e;
    throw e;
  }
  revalidatePath("/");
  return ok("Seri tersimpan.");
}

export async function deleteSeries(id: number) {
  const denied = await guard();
  if (denied) return denied;
  await db.delete(series).where(eq(series.id, id));
  revalidatePath("/");
  return ok("Seri beserta seluruh chapternya dihapus.");
}

/* --------------------------------- chapters -------------------------------- */

export async function upsertChapter(_prev: FormState, fd: FormData): Promise<FormState> {
  const denied = await guard();
  if (denied) return denied;

  const id = num(fd, "id") || null;
  const seriesId = num(fd, "seriesId");
  if (!seriesId) return fail("Seri tidak valid.");

  let pages: PageSlice[] = [];
  try {
    pages = JSON.parse(str(fd, "pages") || "[]");
    if (!Array.isArray(pages)) throw new Error("bad");
    pages = pages
      .map((p) => ({ src: String(p.src ?? ""), pos: Number(p.pos) || 0, ar: String(p.ar ?? "16/9") }))
      .filter((p) => p.src);
  } catch {
    return fail("Data halaman tidak valid.");
  }

  const publishedAt = parseWIB(str(fd, "publishedAt")) ?? new Date();
  const isFree = checked(fd, "isFree");
  const values = {
    seriesId,
    number: num(fd, "number", 1),
    title: str(fd, "title"),
    publishedAt,
    isFree,
    priceCoins: isFree ? 0 : Math.max(0, num(fd, "priceCoins", 30)),
    isPublished: checked(fd, "isPublished"),
    pages,
  };
  if (values.number < 1) return fail("Nomor chapter minimal 1.");
  if (!values.title) return fail("Judul chapter wajib diisi.");
  if (values.isPublished && pages.length === 0) {
    return fail("Chapter yang diterbitkan minimal punya 1 halaman (atau matikan toggle Terbit).");
  }

  try {
    if (id) {
      await db
        .update(chapters)
        .set(values)
        .where(and(eq(chapters.id, id), eq(chapters.seriesId, seriesId)));
    } else {
      await db.insert(chapters).values(values);
    }
  } catch (e) {
    if (isUniqueViolation(e)) return fail(`Chapter nomor ${values.number} sudah ada di seri ini.`);
    throw e;
  }
  return ok(id ? "Chapter diperbarui." : "Chapter ditambahkan.");
}

export async function deleteChapter(id: number) {
  const denied = await guard();
  if (denied) return denied;
  await db.delete(chapters).where(eq(chapters.id, id));
  return ok("Chapter dihapus (unlock terkait ikut dihapus).");
}

/* ---------------------------------- posts --------------------------------- */

export async function upsertPost(_prev: FormState, fd: FormData): Promise<FormState> {
  const denied = await guard();
  if (denied) return denied;

  const id = num(fd, "id", 0);
  const title = str(fd, "title");
  const slug = str(fd, "slug");
  const excerpt = str(fd, "excerpt") || null;
  const content = str(fd, "content");
  const coverImage = str(fd, "coverImage") || null;
  const category = str(fd, "category") || "general";
  const eventIdRaw = str(fd, "eventId");
  const eventId = eventIdRaw && eventIdRaw !== "none" ? Number(eventIdRaw) : null;
  const author = str(fd, "author") || "Redaksi Comic Week";
  const isPublished = checked(fd, "isPublished");

  if (!title) return fail("Judul artikel/update wajib diisi.");
  if (!slug) return fail("Slug URL wajib diisi.");
  if (!content) return fail("Isi konten artikel wajib diisi.");

  let redirectTarget: string | null = null;
  try {
    if (id > 0) {
      await db
        .update(posts)
        .set({
          title,
          slug,
          excerpt,
          content,
          coverImage,
          category,
          eventId,
          author,
          isPublished,
          updatedAt: new Date(),
        })
        .where(eq(posts.id, id));
    } else {
      const [created] = await db
        .insert(posts)
        .values({
          title,
          slug,
          excerpt,
          content,
          coverImage,
          category,
          eventId,
          author,
          isPublished,
        })
        .returning({ id: posts.id });
      redirectTarget = `/admin/posts/${created.id}`;
    }
  } catch (e) {
    if (isUniqueViolation(e)) return fail(`Slug "${slug}" sudah dipakai oleh artikel lain.`);
    return fail(`Gagal menyimpan artikel: ${(e as Error).message}`);
  }

  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/admin/posts");
  revalidatePath("/events");

  if (redirectTarget) redirect(redirectTarget);
  return ok("Artikel blog berhasil disimpan.");
}

export async function deletePost(id: number): Promise<FormState> {
  const denied = await guard();
  if (denied) return denied;
  if (!id) return fail("ID artikel tidak valid.");

  await db.delete(posts).where(eq(posts.id, id));
  revalidatePath("/blog");
  revalidatePath("/admin/posts");
  return ok("Artikel berhasil dihapus.");
}

