import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const eventStatusEnum = pgEnum("event_status", [
  "upcoming",
  "live",
  "ended",
]);

export type TicketTier = {
  name: string;
  price: number;
  label?: string;
  perks: string[];
  highlight?: boolean;
};

export type EventStats = {
  artists: number;
  booths: number;
  visitors: number;
  series: number;
};

export type PageSlice = {
  src: string;
  pos: number; // background-position-y percent
  ar: string; // css aspect-ratio
};

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  edition: varchar("edition", { length: 24 }).notNull(),
  theme: varchar("theme", { length: 140 }).notNull(),
  tagline: varchar("tagline", { length: 220 }),
  description: text("description"),
  city: varchar("city", { length: 90 }),
  venue: varchar("venue", { length: 180 }),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: eventStatusEnum("status").notNull().default("upcoming"),
  isPublished: boolean("is_published").notNull().default(false),
  accent: varchar("accent", { length: 16 }).notNull().default("#C9F73A"),
  accent2: varchar("accent2", { length: 16 }).notNull().default("#8B5CF6"),
  stats: jsonb("stats").$type<EventStats>(),
  tickets: jsonb("tickets").$type<TicketTier[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const guests = pgTable(
  "guests",
  {
    id: serial("id").primaryKey(),
    eventId: integer("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 120 }).notNull(),
    role: varchar("role", { length: 120 }).notNull(),
    origin: varchar("origin", { length: 60 }).notNull(),
    bio: text("bio"),
    color: varchar("color", { length: 16 }).notNull().default("#FF4D00"),
  },
  (t) => [index("guests_event_idx").on(t.eventId)],
);

export const schedules = pgTable(
  "schedules",
  {
    id: serial("id").primaryKey(),
    eventId: integer("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    day: integer("day").notNull(),
    dateLabel: varchar("date_label", { length: 60 }).notNull(),
    time: varchar("time", { length: 24 }).notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    stage: varchar("stage", { length: 120 }).notNull(),
    kind: varchar("kind", { length: 40 }).notNull().default("talk"),
  },
  (t) => [index("schedules_event_idx").on(t.eventId)],
);

export const series = pgTable(
  "series",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 90 }).notNull().unique(),
    title: varchar("title", { length: 160 }).notNull(),
    author: varchar("author", { length: 140 }).notNull(),
    genres: text("genres").array().notNull(),
    synopsis: text("synopsis").notNull(),
    status: varchar("status", { length: 24 }).notNull().default("ongoing"), // ongoing | upcoming | completed
    rating: real("rating").notNull().default(0),
    views: integer("views").notNull().default(0),
    likes: integer("likes").notNull().default(0),
    coverImage: varchar("cover_image", { length: 240 }).notNull(),
    featured: boolean("featured").notNull().default(false),
    releaseDay: varchar("release_day", { length: 24 }),
    eventId: integer("event_id").references(() => events.id, {
      onDelete: "set null",
    }),
  },
  (t) => [index("series_event_idx").on(t.eventId)],
);

export const chapters = pgTable(
  "chapters",
  {
    id: serial("id").primaryKey(),
    seriesId: integer("series_id")
      .notNull()
      .references(() => series.id, { onDelete: "cascade" }),
    number: integer("number").notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    publishedAt: timestamp("published_at").notNull(),
    isFree: boolean("is_free").notNull().default(false),
    priceCoins: integer("price_coins").notNull().default(0),
    isPublished: boolean("is_published").notNull().default(true),
    pages: jsonb("pages").$type<PageSlice[]>().notNull(),
  },
  (t) => [
    index("chapters_series_idx").on(t.seriesId),
    uniqueIndex("chapters_series_number_idx").on(t.seriesId, t.number),
  ],
);

export const wallets = pgTable(
  "wallets",
  {
    id: serial("id").primaryKey(),
    visitorKey: varchar("visitor_key", { length: 80 }).notNull().unique(),
    coins: integer("coins").notNull().default(0),
    welcomeClaimed: boolean("welcome_claimed").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("wallets_visitor_idx").on(t.visitorKey)],
);

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 60 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 220 }).notNull(),
  displayName: varchar("display_name", { length: 90 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const purchases = pgTable(
  "purchases",
  {
    id: serial("id").primaryKey(),
    visitorKey: varchar("visitor_key", { length: 80 }).notNull(),
    chapterId: integer("chapter_id")
      .notNull()
      .references(() => chapters.id, { onDelete: "cascade" }),
    coinsSpent: integer("coins_spent").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("purchases_visitor_chapter_idx").on(t.visitorKey, t.chapterId),
  ],
);

export const posts = pgTable(
  "posts",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 140 }).notNull().unique(),
    title: varchar("title", { length: 220 }).notNull(),
    excerpt: text("excerpt"),
    content: text("content").notNull(),
    coverImage: varchar("cover_image", { length: 500 }),
    category: varchar("category", { length: 60 }).notNull().default("general"), // general | kegiatan | pengumuman | liputan
    eventId: integer("event_id").references(() => events.id, {
      onDelete: "set null",
    }),
    author: varchar("author", { length: 120 }).notNull().default("Redaksi Comic Week"),
    isPublished: boolean("is_published").notNull().default(true),
    publishedAt: timestamp("published_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    index("posts_event_idx").on(t.eventId),
    index("posts_category_idx").on(t.category),
    index("posts_published_idx").on(t.isPublished, t.publishedAt),
  ],
);

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 140 }).notNull().unique(),
    name: varchar("name", { length: 220 }).notNull(),
    description: text("description"),
    price: integer("price").notNull(),
    originalPrice: integer("original_price"),
    category: varchar("category", { length: 80 }).notNull().default("Merchandise"),
    badge: varchar("badge", { length: 80 }),
    image: varchar("image", { length: 500 }).notNull(),
    buyUrl: varchar("buy_url", { length: 500 }).notNull(),
    buyLabel: varchar("buy_label", { length: 80 }).notNull().default("Beli Sekarang"),
    secondaryBuyUrl: varchar("secondary_buy_url", { length: 500 }),
    secondaryBuyLabel: varchar("secondary_buy_label", { length: 80 }).default("Tanya via WhatsApp"),
    stockStatus: varchar("stock_status", { length: 30 }).notNull().default("in_stock"),
    eventId: integer("event_id").references(() => events.id, {
      onDelete: "set null",
    }),
    featured: boolean("featured").notNull().default(false),
    isPublished: boolean("is_published").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    index("products_category_idx").on(t.category),
    index("products_event_idx").on(t.eventId),
    index("products_published_idx").on(t.isPublished),
  ],
);

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;


