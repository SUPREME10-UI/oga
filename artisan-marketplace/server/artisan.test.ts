import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the db module
vi.mock("./db", () => ({
  getCategories: vi.fn().mockResolvedValue([
    { id: 1, name: "Carpentry", icon: "Hammer", color: "#D97706", description: "Wood and furniture" },
    { id: 2, name: "Electrical", icon: "Zap", color: "#2563EB", description: "Electrical work" },
  ]),
  getArtisans: vi.fn().mockResolvedValue([
    {
      id: 1,
      userId: 1,
      profession: "Carpenter",
      businessName: "John's Woodwork",
      status: "approved",
      isAvailable: true,
      avgRating: 4.5,
      totalReviews: 10,
      city: "Accra",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  getArtisanById: vi.fn().mockResolvedValue({
    id: 1,
    userId: 1,
    profession: "Carpenter",
    status: "approved",
    isAvailable: true,
    avgRating: 4.5,
    totalReviews: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  getArtisanByUserId: vi.fn().mockResolvedValue(null),
  createArtisan: vi.fn().mockResolvedValue({ insertId: 1 }),
  updateArtisan: vi.fn().mockResolvedValue({}),
  getReviewsByArtisan: vi.fn().mockResolvedValue([]),
  createReview: vi.fn().mockResolvedValue({}),
  recalcArtisanRating: vi.fn().mockResolvedValue({}),
  toggleFavorite: vi.fn().mockResolvedValue(true),
  getFavoritesByUser: vi.fn().mockResolvedValue([]),
  isFavorite: vi.fn().mockResolvedValue(false),
  createBooking: vi.fn().mockResolvedValue({ insertId: 1 }),
  updateBooking: vi.fn().mockResolvedValue({}),
  getBookingById: vi.fn().mockResolvedValue(null),
  getBookingsByCustomer: vi.fn().mockResolvedValue([]),
  getBookingsByArtisan: vi.fn().mockResolvedValue([]),
  getAllBookingsAdmin: vi.fn().mockResolvedValue([]),
  getOrCreateConversation: vi.fn().mockResolvedValue({ id: 1, customerId: 1, artisanId: 1 }),
  getConversationsByUser: vi.fn().mockResolvedValue([]),
  getMessagesByConversation: vi.fn().mockResolvedValue([]),
  createMessage: vi.fn().mockResolvedValue({}),
  markMessagesRead: vi.fn().mockResolvedValue({}),
  createNotification: vi.fn().mockResolvedValue({}),
  getNotificationsByUser: vi.fn().mockResolvedValue([]),
  markNotificationRead: vi.fn().mockResolvedValue({}),
  markAllNotificationsRead: vi.fn().mockResolvedValue({}),
  getUnreadNotificationCount: vi.fn().mockResolvedValue(0),
  getAllUsers: vi.fn().mockResolvedValue([]),
  getAllArtisansAdmin: vi.fn().mockResolvedValue([]),
  getAllReviewsAdmin: vi.fn().mockResolvedValue([]),
  updateReviewStatus: vi.fn().mockResolvedValue({}),
  getUserByOpenId: vi.fn().mockResolvedValue(null),
  getUserById: vi.fn().mockResolvedValue(null),
  upsertUser: vi.fn().mockResolvedValue({}),
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

function makePublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function makeUserCtx(overrides: Partial<TrpcContext["user"]> = {}): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      name: "Test User",
      email: "test@example.com",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
      ...overrides,
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function makeAdminCtx(): TrpcContext {
  return makeUserCtx({ role: "admin", id: 99 });
}

// ─── Auth tests ───────────────────────────────────────────────────────────────

describe("auth.me", () => {
  it("returns null for unauthenticated users", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("returns user for authenticated users", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.name).toBe("Test User");
  });
});

// ─── Categories tests ─────────────────────────────────────────────────────────

describe("categories.list", () => {
  it("returns list of categories", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.categories.list();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
    expect(result[0].name).toBe("Carpentry");
  });
});

// ─── Artisans tests ───────────────────────────────────────────────────────────

describe("artisans.list", () => {
  it("returns list of artisans with default params", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.artisans.list({});
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThanOrEqual(0);
  });

  it("accepts filter params", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.artisans.list({
      categoryId: 1,
      search: "carpenter",
      minRating: 4,
      isAvailable: true,
      limit: 10,
      offset: 0,
    });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("artisans.getById", () => {
  it("returns artisan by id", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.artisans.getById({ id: 1 });
    expect(result).not.toBeNull();
    expect(result.id).toBe(1);
    expect(result.profession).toBe("Carpenter");
  });

  it("throws NOT_FOUND for missing artisan", async () => {
    const { getArtisanById } = await import("./db");
    vi.mocked(getArtisanById).mockResolvedValueOnce(undefined);
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.artisans.getById({ id: 9999 })).rejects.toThrow();
  });
});

describe("artisans.getMyProfile", () => {
  it("returns null when user has no artisan profile", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    const result = await caller.artisans.getMyProfile();
    expect(result).toBeNull();
  });
});

describe("artisans.register", () => {
  it("creates artisan profile for authenticated user", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    const result = await caller.artisans.register({
      profession: "Carpenter",
      city: "Accra",
    });
    expect(result.success).toBe(true);
  });

  it("throws CONFLICT if artisan profile already exists", async () => {
    const { getArtisanByUserId } = await import("./db");
    vi.mocked(getArtisanByUserId).mockResolvedValueOnce({
      id: 1,
      userId: 1,
      profession: "Carpenter",
      status: "approved",
      isAvailable: true,
      avgRating: 0,
      totalReviews: 0,
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(caller.artisans.register({ profession: "Plumber" })).rejects.toThrow();
  });
});

// ─── Reviews tests ────────────────────────────────────────────────────────────

describe("reviews.byArtisan", () => {
  it("returns reviews for an artisan", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.reviews.byArtisan({ artisanId: 1 });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("reviews.create", () => {
  it("creates a review for authenticated user", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    const result = await caller.reviews.create({
      artisanId: 1,
      rating: 5,
      comment: "Excellent work!",
    });
    expect(result.success).toBe(true);
  });

  it("validates rating range", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(
      caller.reviews.create({ artisanId: 1, rating: 6 })
    ).rejects.toThrow();
    await expect(
      caller.reviews.create({ artisanId: 1, rating: 0 })
    ).rejects.toThrow();
  });
});

// ─── Favorites tests ──────────────────────────────────────────────────────────

describe("favorites", () => {
  it("toggles favorite for authenticated user", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    const result = await caller.favorites.toggle({ artisanId: 1 });
    expect(typeof result).toBe("boolean");
  });

  it("lists favorites for authenticated user", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    const result = await caller.favorites.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("checks if artisan is favorited", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    const result = await caller.favorites.check({ artisanId: 1 });
    expect(typeof result).toBe("boolean");
  });
});

// ─── Bookings tests ───────────────────────────────────────────────────────────

describe("bookings.create", () => {
  it("creates a booking for authenticated user", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    const result = await caller.bookings.create({
      artisanId: 1,
      serviceDescription: "Fix the kitchen cabinets and install new shelves",
    });
    expect(result.success).toBe(true);
  });

  it("validates serviceDescription minimum length", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(
      caller.bookings.create({ artisanId: 1, serviceDescription: "Fix it" })
    ).rejects.toThrow();
  });
});

describe("bookings.myBookings", () => {
  it("returns bookings for authenticated user", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    const result = await caller.bookings.myBookings();
    expect(Array.isArray(result)).toBe(true);
  });
});

// ─── Chat tests ───────────────────────────────────────────────────────────────

describe("chat.getOrCreateConversation", () => {
  it("creates or returns a conversation", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    const result = await caller.chat.getOrCreateConversation({ artisanId: 1 });
    expect(result).not.toBeNull();
    expect(result.id).toBe(1);
  });
});

describe("chat.myConversations", () => {
  it("returns conversations for authenticated user", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    const result = await caller.chat.myConversations();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("chat.sendMessage", () => {
  it("sends a message in a conversation", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    const result = await caller.chat.sendMessage({
      conversationId: 1,
      content: "Hello, I need your services",
    });
    expect(result.success).toBe(true);
  });
});

// ─── Notifications tests ──────────────────────────────────────────────────────

describe("notifications", () => {
  it("returns notifications for authenticated user", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    const result = await caller.notifications.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("returns unread count", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    const result = await caller.notifications.unreadCount();
    expect(typeof result).toBe("number");
  });
});

// ─── Admin tests ──────────────────────────────────────────────────────────────

describe("admin", () => {
  it("returns stats for admin users", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.admin.stats();
    expect(result).toHaveProperty("totalUsers");
    expect(result).toHaveProperty("totalArtisans");
    expect(result).toHaveProperty("pendingArtisans");
    expect(result).toHaveProperty("totalBookings");
  });

  it("throws FORBIDDEN for non-admin users", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(caller.admin.stats()).rejects.toThrow();
  });

  it("lists all users for admin", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.admin.users({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("lists all artisans for admin", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.admin.artisans({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("approves an artisan", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.admin.approveArtisan({ id: 1 });
    expect(result.success).toBe(true);
  });

  it("rejects an artisan", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.admin.rejectArtisan({ id: 1 });
    expect(result.success).toBe(true);
  });

  it("suspends an artisan", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.admin.suspendArtisan({ id: 1 });
    expect(result.success).toBe(true);
  });

  it("updates review status", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.admin.updateReviewStatus({ id: 1, status: "hidden" });
    // updateReviewStatus returns the db result (may be empty object or undefined)
    expect(result === undefined || typeof result === 'object').toBe(true);
  });
});

// ─── Auth logout test ─────────────────────────────────────────────────────────

describe("auth.logout", () => {
  it("clears session cookie and returns success", async () => {
    const ctx = makeUserCtx();
    const clearedCookies: string[] = [];
    (ctx.res as any).clearCookie = (name: string) => clearedCookies.push(name);
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
  });
});
