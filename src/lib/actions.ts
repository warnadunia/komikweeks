"use server";

import { and, eq, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "@/db";
import { chapters, purchases, wallets } from "@/db/schema";
import { VISITOR_COOKIE } from "@/lib/visitor";
import { WELCOME_COINS } from "@/lib/utils";

async function ensureVisitor(): Promise<string> {
  const store = await cookies();
  const existing = store.get(VISITOR_COOKIE)?.value;
  if (existing) return existing;
  const key = crypto.randomUUID();
  store.set(VISITOR_COOKIE, key, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365 * 3,
    sameSite: "lax",
  });
  return key;
}

async function ensureWallet(visitorKey: string) {
  const [existing] = await db
    .select()
    .from(wallets)
    .where(eq(wallets.visitorKey, visitorKey))
    .limit(1);
  if (existing) return existing;
  const [created] = await db
    .insert(wallets)
    .values({ visitorKey, coins: 0 })
    .returning();
  return created;
}

export type ActionResult =
  | { ok: true; coins: number }
  | { ok: false; error: string; coins: number };

export async function claimWelcomeCoins(): Promise<ActionResult> {
  const key = await ensureVisitor();
  const wallet = await ensureWallet(key);
  if (wallet.welcomeClaimed) {
    return { ok: false, error: "Koin sambutan sudah pernah diklaim.", coins: wallet.coins };
  }
  const [updated] = await db
    .update(wallets)
    .set({ welcomeClaimed: true, coins: wallet.coins + WELCOME_COINS })
    .where(eq(wallets.visitorKey, key))
    .returning();
  return { ok: true, coins: updated.coins };
}

export async function topUpCoins(amount: number): Promise<ActionResult> {
  const allowed = [50, 120, 300];
  if (!allowed.includes(amount)) {
    return { ok: false, error: "Paket koin tidak valid.", coins: 0 };
  }
  const key = await ensureVisitor();
  const wallet = await ensureWallet(key);
  const [updated] = await db
    .update(wallets)
    .set({ coins: wallet.coins + amount })
    .where(eq(wallets.visitorKey, key))
    .returning();
  return { ok: true, coins: updated.coins };
}

export async function unlockChapter(chapterId: number): Promise<ActionResult> {
  const key = await ensureVisitor();
  const wallet = await ensureWallet(key);

  const [ch] = await db
    .select()
    .from(chapters)
    .where(eq(chapters.id, chapterId))
    .limit(1);
  if (!ch || !ch.isPublished) {
    return { ok: false, error: "Chapter tidak ditemukan.", coins: wallet.coins };
  }
  if (ch.isFree || ch.priceCoins <= 0) return { ok: true, coins: wallet.coins };

  const [owned] = await db
    .select({ id: purchases.id })
    .from(purchases)
    .where(and(eq(purchases.visitorKey, key), eq(purchases.chapterId, chapterId)))
    .limit(1);
  if (owned) return { ok: true, coins: wallet.coins };

  if (wallet.coins < ch.priceCoins) {
    return {
      ok: false,
      error: `Koin Tinta kurang ${ch.priceCoins - wallet.coins} lagi. Isi ulang dulu, ya.`,
      coins: wallet.coins,
    };
  }

  const result = await db.transaction(async (tx) => {
    await tx.insert(purchases).values({
      visitorKey: key,
      chapterId,
      coinsSpent: ch.priceCoins,
    });
    const [u] = await tx
      .update(wallets)
      .set({ coins: sql`${wallets.coins} - ${ch.priceCoins}` })
      .where(eq(wallets.visitorKey, key))
      .returning();
    return u;
  });

  return { ok: true, coins: result.coins };
}
