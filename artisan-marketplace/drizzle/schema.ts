import {
  boolean,
  decimal,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  json,
  float,
} from "drizzle-orm/mysql-core";

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  avatarUrl: text("avatarUrl"),
  phone: varchar("phone", { length: 32 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Artisan Categories ───────────────────────────────────────────────────────
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  icon: varchar("icon", { length: 50 }).notNull(),
  description: text("description"),
  color: varchar("color", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;

// ─── Artisan Profiles ─────────────────────────────────────────────────────────
export const artisans = mysqlTable("artisans", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  categoryId: int("categoryId"),
  businessName: varchar("businessName", { length: 200 }),
  profession: varchar("profession", { length: 100 }).notNull(),
  bio: text("bio"),
  phone: varchar("phone", { length: 32 }),
  email: varchar("email", { length: 320 }),
  website: varchar("website", { length: 500 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  country: varchar("country", { length: 100 }).default("Ghana"),
  latitude: float("latitude"),
  longitude: float("longitude"),
  avatarUrl: text("avatarUrl"),
  coverUrl: text("coverUrl"),
  portfolioImages: json("portfolioImages").$type<string[]>(),
  services: json("services").$type<string[]>(),
  priceMin: decimal("priceMin", { precision: 10, scale: 2 }),
  priceMax: decimal("priceMax", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 10 }).default("GHS"),
  isAvailable: boolean("isAvailable").default(true).notNull(),
  isVerified: boolean("isVerified").default(false).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "suspended"]).default("pending").notNull(),
  yearsExperience: int("yearsExperience"),
  languages: json("languages").$type<string[]>(),
  avgRating: float("avgRating").default(0),
  totalReviews: int("totalReviews").default(0),
  totalBookings: int("totalBookings").default(0),
  stripeAccountId: varchar("stripeAccountId", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Artisan = typeof artisans.$inferSelect;
export type InsertArtisan = typeof artisans.$inferInsert;

// ─── Reviews ──────────────────────────────────────────────────────────────────
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  artisanId: int("artisanId").notNull(),
  customerId: int("customerId").notNull(),
  bookingId: int("bookingId"),
  rating: int("rating").notNull(), // 1-5
  comment: text("comment"),
  ownerReply: text("ownerReply"),
  isFlagged: boolean("isFlagged").default(false),
  flagReason: text("flagReason"),
  status: mysqlEnum("status", ["published", "hidden", "flagged"]).default("published").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

// ─── Favorites ────────────────────────────────────────────────────────────────
export const favorites = mysqlTable("favorites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  artisanId: int("artisanId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Favorite = typeof favorites.$inferSelect;

// ─── Bookings ─────────────────────────────────────────────────────────────────
export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  artisanId: int("artisanId").notNull(),
  customerId: int("customerId").notNull(),
  serviceDescription: text("serviceDescription").notNull(),
  scheduledAt: timestamp("scheduledAt"),
  address: text("address"),
  status: mysqlEnum("status", ["pending", "confirmed", "in_progress", "completed", "cancelled", "disputed"]).default("pending").notNull(),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }),
  depositAmount: decimal("depositAmount", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 10 }).default("GHS"),
  paymentStatus: mysqlEnum("paymentStatus", ["unpaid", "deposit_paid", "fully_paid", "refunded"]).default("unpaid").notNull(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 200 }),
  stripeSessionId: varchar("stripeSessionId", { length: 200 }),
  notes: text("notes"),
  disputeReason: text("disputeReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

// ─── Messages / Chat ──────────────────────────────────────────────────────────
export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull(),
  artisanId: int("artisanId").notNull(),
  lastMessageAt: timestamp("lastMessageAt").defaultNow(),
  lastMessagePreview: varchar("lastMessagePreview", { length: 200 }),
  customerUnread: int("customerUnread").default(0),
  artisanUnread: int("artisanUnread").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;

export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  senderId: int("senderId").notNull(),
  content: text("content").notNull(),
  messageType: mysqlEnum("messageType", ["text", "image", "booking_request"]).default("text").notNull(),
  isRead: boolean("isRead").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// ─── Notifications ────────────────────────────────────────────────────────────
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  body: text("body"),
  type: mysqlEnum("type", ["message", "booking", "review", "system", "payment"]).default("system").notNull(),
  referenceId: int("referenceId"),
  referenceType: varchar("referenceType", { length: 50 }),
  isRead: boolean("isRead").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
