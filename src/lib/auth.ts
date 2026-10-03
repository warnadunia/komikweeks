import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { signValue, verifySignature } from "@/lib/password";

export const ADMIN_COOKIE = "cw_admin";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 hari

export type AdminUser = typeof adminUsers.$inferSelect;

export async function setAdminSession(userId: number) {
  const exp = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = `${userId}.${exp}`;
  const token = `${payload}.${signValue(payload)}`;
  const store = await cookies();
  store.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}

export async function getAdminUser(): Promise<AdminUser | null> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  const lastDot = token.lastIndexOf(".");
  if (lastDot <= 0) return null;
  const payload = token.slice(0, lastDot);
  const sig = token.slice(lastDot + 1);
  if (!verifySignature(payload, sig)) return null;
  const [idRaw, expRaw] = payload.split(".");
  const id = Number(idRaw);
  const exp = Number(expRaw);
  if (!Number.isInteger(id) || !Number.isFinite(exp) || exp < Date.now()) return null;
  const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, id)).limit(1);
  return user ?? null;
}

export async function requireAdmin(): Promise<AdminUser> {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return user;
}

/** For server actions — no redirect, returns error-friendly result. */
export async function requireAdminForAction(): Promise<AdminUser | null> {
  return getAdminUser();
}
