import { and, desc, eq, gte, ilike, like, lte, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  Artisan,
  InsertArtisan,
  InsertBooking,
  InsertMessage,
  InsertReview,
  InsertUser,
  artisans,
  bookings,
  categories,
  conversations,
  favorites,
  messages,
  notifications,
  reviews,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod", "avatarUrl", "phone"] as const;

  for (const field of textFields) {
    const value = user[field];
    if (value === undefined) continue;
    const normalized = value ?? null;
    (values as Record<string, unknown>)[field] = normalized;
    updateSet[field] = normalized;
  }

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function getAllUsers(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt)).limit(limit).offset(offset);
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).orderBy(categories.name);
}

// ─── Artisans ─────────────────────────────────────────────────────────────────

export async function createArtisan(data: InsertArtisan) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(artisans).values(data);
  return result;
}

export async function updateArtisan(id: number, data: Partial<InsertArtisan>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  return db.update(artisans).set(data).where(eq(artisans.id, id));
}

export async function getArtisanById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(artisans).where(eq(artisans.id, id)).limit(1);
  return result[0];
}

export async function getArtisanByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(artisans).where(eq(artisans.userId, userId)).limit(1);
  return result[0];
}

export interface ArtisanFilters {
  categoryId?: number;
  search?: string;
  minRating?: number;
  maxPrice?: number;
  minPrice?: number;
  isAvailable?: boolean;
  status?: "pending" | "approved" | "rejected" | "suspended";
  limit?: number;
  offset?: number;
}

export async function getArtisans(filters: ArtisanFilters = {}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(artisans.status, filters.status ?? "approved")];

  if (filters.categoryId) conditions.push(eq(artisans.categoryId, filters.categoryId));
  if (filters.isAvailable !== undefined) conditions.push(eq(artisans.isAvailable, filters.isAvailable));
  if (filters.minRating) conditions.push(gte(artisans.avgRating, filters.minRating));
  if (filters.minPrice) conditions.push(gte(artisans.priceMin, String(filters.minPrice)));
  if (filters.maxPrice) conditions.push(lte(artisans.priceMax, String(filters.maxPrice)));
  if (filters.search) {
    conditions.push(
      or(
        like(artisans.profession, `%${filters.search}%`),
        like(artisans.businessName, `%${filters.search}%`),
        like(artisans.city, `%${filters.search}%`),
      )!
    );
  }

  return db
    .select()
    .from(artisans)
    .where(and(...conditions))
    .orderBy(desc(artisans.avgRating))
    .limit(filters.limit ?? 50)
    .offset(filters.offset ?? 0);
}

export async function getAllArtisansAdmin(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(artisans).orderBy(desc(artisans.createdAt)).limit(limit).offset(offset);
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export async function createReview(data: InsertReview) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(reviews).values(data);
  // Update artisan avg rating
  await recalcArtisanRating(data.artisanId);
  return result;
}

export async function getReviewsByArtisan(artisanId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(reviews)
    .where(and(eq(reviews.artisanId, artisanId), eq(reviews.status, "published")))
    .orderBy(desc(reviews.createdAt));
}

export async function recalcArtisanRating(artisanId: number) {
  const db = await getDb();
  if (!db) return;
  const result = await db
    .select({ avg: sql<number>`AVG(${reviews.rating})`, count: sql<number>`COUNT(*)` })
    .from(reviews)
    .where(and(eq(reviews.artisanId, artisanId), eq(reviews.status, "published")));
  const { avg, count } = result[0] ?? { avg: 0, count: 0 };
  await db
    .update(artisans)
    .set({ avgRating: avg ?? 0, totalReviews: count ?? 0 })
    .where(eq(artisans.id, artisanId));
}

export async function getAllReviewsAdmin(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reviews).orderBy(desc(reviews.createdAt)).limit(limit).offset(offset);
}

export async function updateReviewStatus(id: number, status: "published" | "hidden" | "flagged") {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const review = await db.select().from(reviews).where(eq(reviews.id, id)).limit(1);
  await db.update(reviews).set({ status }).where(eq(reviews.id, id));
  if (review[0]) await recalcArtisanRating(review[0].artisanId);
}

// ─── Favorites ────────────────────────────────────────────────────────────────

export async function toggleFavorite(userId: number, artisanId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const existing = await db
    .select()
    .from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.artisanId, artisanId)))
    .limit(1);
  if (existing.length > 0) {
    await db.delete(favorites).where(and(eq(favorites.userId, userId), eq(favorites.artisanId, artisanId)));
    return false;
  } else {
    await db.insert(favorites).values({ userId, artisanId });
    return true;
  }
}

export async function getFavoritesByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(favorites).where(eq(favorites.userId, userId));
}

export async function isFavorite(userId: number, artisanId: number) {
  const db = await getDb();
  if (!db) return false;
  const result = await db
    .select()
    .from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.artisanId, artisanId)))
    .limit(1);
  return result.length > 0;
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

export async function createBooking(data: InsertBooking) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(bookings).values(data);
  return result;
}

export async function updateBooking(id: number, data: Partial<InsertBooking>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  return db.update(bookings).set(data).where(eq(bookings.id, id));
}

export async function getBookingById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  return result[0];
}

export async function getBookingsByCustomer(customerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bookings).where(eq(bookings.customerId, customerId)).orderBy(desc(bookings.createdAt));
}

export async function getBookingsByArtisan(artisanId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bookings).where(eq(bookings.artisanId, artisanId)).orderBy(desc(bookings.createdAt));
}

export async function getAllBookingsAdmin(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bookings).orderBy(desc(bookings.createdAt)).limit(limit).offset(offset);
}

// ─── Conversations & Messages ─────────────────────────────────────────────────

export async function getOrCreateConversation(customerId: number, artisanId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const existing = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.customerId, customerId), eq(conversations.artisanId, artisanId)))
    .limit(1);
  if (existing.length > 0) return existing[0];
  await db.insert(conversations).values({ customerId, artisanId });
  const created = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.customerId, customerId), eq(conversations.artisanId, artisanId)))
    .limit(1);
  return created[0];
}

export async function getConversationsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(conversations)
    .where(or(eq(conversations.customerId, userId), eq(conversations.artisanId, userId)))
    .orderBy(desc(conversations.lastMessageAt));
}

export async function getMessagesByConversation(conversationId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt)
    .limit(limit);
}

export async function createMessage(data: InsertMessage) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(messages).values(data);
  // Update conversation preview
  await db
    .update(conversations)
    .set({
      lastMessageAt: new Date(),
      lastMessagePreview: data.content.substring(0, 100),
    })
    .where(eq(conversations.id, data.conversationId));
  return result;
}

export async function markMessagesRead(conversationId: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(messages)
    .set({ isRead: true })
    .where(and(eq(messages.conversationId, conversationId)));
}

// ─── Notifications ────────────────────────────────────────────────────────────

export async function createNotification(data: {
  userId: number;
  title: string;
  body?: string;
  type: "message" | "booking" | "review" | "system" | "payment";
  referenceId?: number;
  referenceType?: string;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(notifications).values(data);
}

export async function getNotificationsByUser(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function markNotificationRead(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
}

export async function markAllNotificationsRead(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
}

export async function getUnreadNotificationCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  return result[0]?.count ?? 0;
}
