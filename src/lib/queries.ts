import { and, asc, desc, eq, inArray, ne, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { chapters, events, guests, purchases, schedules, series, wallets, posts, products } from "@/db/schema";

/* ---------------------------------- events --------------------------------- */

export async function getPublishedEvents() {
  return db
    .select()
    .from(events)
    .where(eq(events.isPublished, true))
    .orderBy(desc(events.startDate));
}

/** The edition to spotlight on the hub: live > nearest upcoming > latest ended. */
export async function getFeaturedEvent() {
  const all = await getPublishedEvents();
  const live = all.find((e) => e.status === "live");
  if (live) return live;
  const upcoming = all
    .filter((e) => e.status === "upcoming")
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  return upcoming[0] ?? all[0] ?? null;
}

export async function getEventBySlug(slug: string) {
  const [ev] = await db
    .select()
    .from(events)
    .where(and(eq(events.slug, slug), eq(events.isPublished, true)))
    .limit(1);
  return ev ?? null;
}

export async function getEventBundle(slug: string) {
  const event = await getEventBySlug(slug);
  if (!event) return null;
  const [guestRows, scheduleRows, debutSeries] = await Promise.all([
    db.select().from(guests).where(eq(guests.eventId, event.id)),
    db
      .select()
      .from(schedules)
      .where(eq(schedules.eventId, event.id))
      .orderBy(asc(schedules.day), asc(schedules.time)),
    db.select().from(series).where(eq(series.eventId, event.id)),
  ]);
  return { event, guests: guestRows, schedules: scheduleRows, debutSeries };
}

/* ---------------------------------- series --------------------------------- */

export type SeriesCardData = {
  id: number;
  slug: string;
  title: string;
  author: string;
  genres: string[];
  status: string;
  rating: number;
  views: number;
  likes: number;
  coverImage: string;
  featured: boolean;
  releaseDay: string | null;
  chapterCount: number;
  debutName: string | null;
  debutSlug: string | null;
  debutEdition: string | null;
  eventId: number | null;
};

export async function getSeriesCards(): Promise<SeriesCardData[]> {
  const rows = await db
    .select({
      id: series.id,
      slug: series.slug,
      title: series.title,
      author: series.author,
      genres: series.genres,
      status: series.status,
      rating: series.rating,
      views: series.views,
      likes: series.likes,
      coverImage: series.coverImage,
      featured: series.featured,
      releaseDay: series.releaseDay,
      debutName: events.name,
      debutSlug: events.slug,
      debutEdition: events.edition,
      eventId: series.eventId,
      chapterCount: sql<number>`(
        select count(*)::int from ${chapters}
        where ${chapters.seriesId} = ${series.id} and ${chapters.isPublished} = true
      )`.as("chapter_count"),
    })
    .from(series)
    .leftJoin(events, eq(series.eventId, events.id))
    .orderBy(desc(series.rating));
  return rows;
}

export async function getSeriesBySlug(slug: string) {
  const rows = await db
    .select({
      series: series,
      debutName: events.name,
      debutSlug: events.slug,
    })
    .from(series)
    .leftJoin(events, eq(series.eventId, events.id))
    .where(eq(series.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

export async function getChaptersForSeries(seriesId: number) {
  return db
    .select()
    .from(chapters)
    .where(eq(chapters.seriesId, seriesId))
    .orderBy(asc(chapters.number));
}

export async function getChapter(seriesSlug: string, num: number) {
  const s = await getSeriesBySlug(seriesSlug);
  if (!s) return null;
  const [ch] = await db
    .select()
    .from(chapters)
    .where(
      and(
        eq(chapters.seriesId, s.series.id),
        eq(chapters.number, num),
        eq(chapters.isPublished, true),
      ),
    )
    .limit(1);
  if (!ch) return null;
  const siblings = await db
    .select({ number: chapters.number })
    .from(chapters)
    .where(and(eq(chapters.seriesId, s.series.id), eq(chapters.isPublished, true)))
    .orderBy(asc(chapters.number));
  return { series: s.series, chapter: ch, publishedNumbers: siblings.map((r) => r.number) };
}

/* ---------------------------------- wallet --------------------------------- */

export async function getWallet(visitorKey: string) {
  const [w] = await db
    .select()
    .from(wallets)
    .where(eq(wallets.visitorKey, visitorKey))
    .limit(1);
  return w ?? null;
}

export async function getOwnedChapterIds(visitorKey: string, chapterIds: number[]) {
  if (chapterIds.length === 0) return new Set<number>();
  const rows = await db
    .select({ chapterId: purchases.chapterId })
    .from(purchases)
    .where(and(eq(purchases.visitorKey, visitorKey), inArray(purchases.chapterId, chapterIds)));
  return new Set(rows.map((r) => r.chapterId));
}

export async function hasPurchased(visitorKey: string, chapterId: number) {
  const [row] = await db
    .select({ id: purchases.id })
    .from(purchases)
    .where(and(eq(purchases.visitorKey, visitorKey), eq(purchases.chapterId, chapterId)))
    .limit(1);
  return !!row;
}

export async function countUnlocks(visitorKey: string) {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(purchases)
    .where(eq(purchases.visitorKey, visitorKey));
  return row?.n ?? 0;
}

/** Unused but kept for future filters */
export async function getSeriesExcept(slug: string) {
  return db.select().from(series).where(ne(series.slug, slug)).limit(4);
}

export async function getEventsOrNone() {
  const all = await getPublishedEvents();
  return all.length > 0 ? all : null;
}

/* ---------------------------------- posts / blog --------------------------- */

export type PostCardData = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  category: string;
  author: string;
  isPublished: boolean;
  publishedAt: Date;
  eventId: number | null;
  eventName: string | null;
  eventSlug: string | null;
  eventEdition: string | null;
};

export async function getPublishedPosts(options?: {
  eventId?: number | null;
  category?: string;
  limit?: number;
}): Promise<PostCardData[]> {
  const conditions = [eq(posts.isPublished, true)];

  if (options?.eventId !== undefined) {
    if (options.eventId === null) {
      conditions.push(sql`${posts.eventId} is null`);
    } else {
      conditions.push(eq(posts.eventId, options.eventId));
    }
  }

  if (options?.category && options.category !== "all") {
    conditions.push(eq(posts.category, options.category));
  }

  const query = db
    .select({
      id: posts.id,
      slug: posts.slug,
      title: posts.title,
      excerpt: posts.excerpt,
      content: posts.content,
      coverImage: posts.coverImage,
      category: posts.category,
      author: posts.author,
      isPublished: posts.isPublished,
      publishedAt: posts.publishedAt,
      eventId: posts.eventId,
      eventName: events.name,
      eventSlug: events.slug,
      eventEdition: events.edition,
    })
    .from(posts)
    .leftJoin(events, eq(posts.eventId, events.id))
    .where(and(...conditions))
    .orderBy(desc(posts.publishedAt));

  if (options?.limit) {
    return query.limit(options.limit);
  }

  return query;
}

export async function getPostBySlug(slug: string): Promise<PostCardData | null> {
  const rows = await db
    .select({
      id: posts.id,
      slug: posts.slug,
      title: posts.title,
      excerpt: posts.excerpt,
      content: posts.content,
      coverImage: posts.coverImage,
      category: posts.category,
      author: posts.author,
      isPublished: posts.isPublished,
      publishedAt: posts.publishedAt,
      eventId: posts.eventId,
      eventName: events.name,
      eventSlug: events.slug,
      eventEdition: events.edition,
    })
    .from(posts)
    .leftJoin(events, eq(posts.eventId, events.id))
    .where(and(eq(posts.slug, slug), eq(posts.isPublished, true)))
    .limit(1);

  return rows[0] ?? null;
}

export async function getPostsForEvent(eventId: number, limit = 6): Promise<PostCardData[]> {
  return getPublishedPosts({ eventId, limit });
}

export async function getAllPostsAdmin() {
  return db
    .select({
      post: posts,
      eventName: events.name,
      eventEdition: events.edition,
    })
    .from(posts)
    .leftJoin(events, eq(posts.eventId, events.id))
    .orderBy(desc(posts.publishedAt));
}

export async function getPostByIdAdmin(id: number) {
  const [row] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  return row ?? null;
}

/* -------------------------------- products -------------------------------- */

export type ProductCardData = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  originalPrice: number | null;
  category: string;
  badge: string | null;
  image: string;
  buyUrl: string;
  buyLabel: string;
  secondaryBuyUrl: string | null;
  secondaryBuyLabel: string | null;
  stockStatus: string;
  eventId: number | null;
  eventName: string | null;
  eventSlug: string | null;
  eventEdition: string | null;
  featured: boolean;
  isPublished: boolean;
  createdAt: Date;
};

export async function getPublishedProducts(opts?: {
  category?: string;
  eventId?: number;
  featured?: boolean;
}): Promise<ProductCardData[]> {
  const conditions = [eq(products.isPublished, true)];
  if (opts?.category && opts.category !== "Semua") {
    conditions.push(eq(products.category, opts.category));
  }
  if (opts?.eventId) {
    conditions.push(eq(products.eventId, opts.eventId));
  }
  if (opts?.featured) {
    conditions.push(eq(products.featured, true));
  }

  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      description: products.description,
      price: products.price,
      originalPrice: products.originalPrice,
      category: products.category,
      badge: products.badge,
      image: products.image,
      buyUrl: products.buyUrl,
      buyLabel: products.buyLabel,
      secondaryBuyUrl: products.secondaryBuyUrl,
      secondaryBuyLabel: products.secondaryBuyLabel,
      stockStatus: products.stockStatus,
      eventId: products.eventId,
      eventName: events.name,
      eventSlug: events.slug,
      eventEdition: events.edition,
      featured: products.featured,
      isPublished: products.isPublished,
      createdAt: products.createdAt,
    })
    .from(products)
    .leftJoin(events, eq(products.eventId, events.id))
    .where(and(...conditions))
    .orderBy(desc(products.featured), desc(products.createdAt));

  return rows;
}

export async function getProductBySlug(slug: string): Promise<ProductCardData | null> {
  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      description: products.description,
      price: products.price,
      originalPrice: products.originalPrice,
      category: products.category,
      badge: products.badge,
      image: products.image,
      buyUrl: products.buyUrl,
      buyLabel: products.buyLabel,
      secondaryBuyUrl: products.secondaryBuyUrl,
      secondaryBuyLabel: products.secondaryBuyLabel,
      stockStatus: products.stockStatus,
      eventId: products.eventId,
      eventName: events.name,
      eventSlug: events.slug,
      eventEdition: events.edition,
      featured: products.featured,
      isPublished: products.isPublished,
      createdAt: products.createdAt,
    })
    .from(products)
    .leftJoin(events, eq(products.eventId, events.id))
    .where(and(eq(products.slug, slug), eq(products.isPublished, true)))
    .limit(1);

  return rows[0] ?? null;
}

export async function getAllProductsAdmin() {
  return db
    .select({
      product: products,
      eventName: events.name,
      eventEdition: events.edition,
    })
    .from(products)
    .leftJoin(events, eq(products.eventId, events.id))
    .orderBy(desc(products.createdAt));
}

export async function getProductByIdAdmin(id: number) {
  const [row] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return row ?? null;
}

export { or };

