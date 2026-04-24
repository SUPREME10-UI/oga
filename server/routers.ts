import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { notifyOwner } from "./_core/notification";
import * as db from "./db";

// Admin guard middleware
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  return next({ ctx });
});

// Artisan guard - user must have an approved artisan profile
const artisanProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const artisan = await db.getArtisanByUserId(ctx.user.id);
  if (!artisan) throw new TRPCError({ code: "FORBIDDEN", message: "Artisan profile required" });
  return next({ ctx: { ...ctx, artisan } });
});

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Categories ─────────────────────────────────────────────────────────────
  categories: router({
    list: publicProcedure.query(() => db.getCategories()),
  }),

  // ─── Artisans ────────────────────────────────────────────────────────────────
  artisans: router({
    list: publicProcedure
      .input(
        z.object({
          categoryId: z.number().optional(),
          search: z.string().optional(),
          minRating: z.number().optional(),
          minPrice: z.number().optional(),
          maxPrice: z.number().optional(),
          isAvailable: z.boolean().optional(),
          limit: z.number().default(50),
          offset: z.number().default(0),
        })
      )
      .query(({ input }) => db.getArtisans(input)),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const artisan = await db.getArtisanById(input.id);
        if (!artisan) throw new TRPCError({ code: "NOT_FOUND" });
        return artisan;
      }),

    getMyProfile: protectedProcedure.query(async ({ ctx }) => {
      const artisan = await db.getArtisanByUserId(ctx.user.id);
      return artisan ?? null;
    }),

    register: protectedProcedure
      .input(
        z.object({
          profession: z.string().min(2),
          businessName: z.string().optional(),
          bio: z.string().optional(),
          phone: z.string().optional(),
          email: z.string().email().optional(),
          address: z.string().optional(),
          city: z.string().optional(),
          state: z.string().optional(),
          country: z.string().optional(),
          latitude: z.number().optional(),
          longitude: z.number().optional(),
          categoryId: z.number().optional(),
          priceMin: z.string().optional(),
          priceMax: z.string().optional(),
          yearsExperience: z.number().optional(),
          services: z.array(z.string()).optional(),
          languages: z.array(z.string()).optional(),
          portfolioImages: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const existing = await db.getArtisanByUserId(ctx.user.id);
        if (existing) throw new TRPCError({ code: "CONFLICT", message: "Artisan profile already exists" });
        await db.createArtisan({ ...input, userId: ctx.user.id, status: "pending" });
        // Notify owner
        await notifyOwner({
          title: "New Artisan Registration",
          content: `${ctx.user.name ?? "A user"} has registered as an artisan (${input.profession}). Please review and approve their profile.`,
        });
        return { success: true };
      }),

    update: protectedProcedure
      .input(
        z.object({
          profession: z.string().optional(),
          businessName: z.string().optional(),
          bio: z.string().optional(),
          phone: z.string().optional(),
          email: z.string().email().optional(),
          address: z.string().optional(),
          city: z.string().optional(),
          state: z.string().optional(),
          country: z.string().optional(),
          latitude: z.number().optional(),
          longitude: z.number().optional(),
          categoryId: z.number().optional(),
          priceMin: z.string().optional(),
          priceMax: z.string().optional(),
          yearsExperience: z.number().optional(),
          isAvailable: z.boolean().optional(),
          services: z.array(z.string()).optional(),
          languages: z.array(z.string()).optional(),
          avatarUrl: z.string().optional(),
          coverUrl: z.string().optional(),
          portfolioImages: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const artisan = await db.getArtisanByUserId(ctx.user.id);
        if (!artisan) throw new TRPCError({ code: "NOT_FOUND" });
        await db.updateArtisan(artisan.id, input);
        return { success: true };
      }),

    toggleAvailability: protectedProcedure.mutation(async ({ ctx }) => {
      const artisan = await db.getArtisanByUserId(ctx.user.id);
      if (!artisan) throw new TRPCError({ code: "NOT_FOUND" });
      await db.updateArtisan(artisan.id, { isAvailable: !artisan.isAvailable });
      return { isAvailable: !artisan.isAvailable };
    }),
  }),

  // ─── Reviews ─────────────────────────────────────────────────────────────────
  reviews: router({
    byArtisan: publicProcedure
      .input(z.object({ artisanId: z.number() }))
      .query(({ input }) => db.getReviewsByArtisan(input.artisanId)),

    create: protectedProcedure
      .input(
        z.object({
          artisanId: z.number(),
          rating: z.number().min(1).max(5),
          comment: z.string().optional(),
          bookingId: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await db.createReview({ ...input, customerId: ctx.user.id });
        // Notify artisan owner if rating is 1 or 2
        if (input.rating <= 2) {
          await notifyOwner({
            title: "Critical Review Posted",
            content: `A ${input.rating}-star review was posted for artisan #${input.artisanId}. Please review for moderation.`,
          });
        }
        return { success: true };
      }),
  }),

  // ─── Favorites ───────────────────────────────────────────────────────────────
  favorites: router({
    toggle: protectedProcedure
      .input(z.object({ artisanId: z.number() }))
      .mutation(({ ctx, input }) => db.toggleFavorite(ctx.user.id, input.artisanId)),

    list: protectedProcedure.query(({ ctx }) => db.getFavoritesByUser(ctx.user.id)),

    check: protectedProcedure
      .input(z.object({ artisanId: z.number() }))
      .query(({ ctx, input }) => db.isFavorite(ctx.user.id, input.artisanId)),
  }),

  // ─── Bookings ────────────────────────────────────────────────────────────────
  bookings: router({
    create: protectedProcedure
      .input(
        z.object({
          artisanId: z.number(),
          serviceDescription: z.string().min(10),
          scheduledAt: z.string().optional(),
          address: z.string().optional(),
          totalAmount: z.string().optional(),
          depositAmount: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const artisan = await db.getArtisanById(input.artisanId);
        if (!artisan) throw new TRPCError({ code: "NOT_FOUND" });
        const data = {
          ...input,
          customerId: ctx.user.id,
          scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
        };
        await db.createBooking(data);
        // Create notification for artisan
        await db.createNotification({
          userId: artisan.userId,
          title: "New Booking Request",
          body: `You have a new booking request: ${input.serviceDescription.substring(0, 80)}`,
          type: "booking",
        });
        return { success: true };
      }),

    myBookings: protectedProcedure.query(({ ctx }) => db.getBookingsByCustomer(ctx.user.id)),

    artisanBookings: protectedProcedure.query(async ({ ctx }) => {
      const artisan = await db.getArtisanByUserId(ctx.user.id);
      if (!artisan) return [];
      return db.getBookingsByArtisan(artisan.id);
    }),

    updateStatus: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["pending", "confirmed", "in_progress", "completed", "cancelled", "disputed"]),
          disputeReason: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const booking = await db.getBookingById(input.id);
        if (!booking) throw new TRPCError({ code: "NOT_FOUND" });
        const artisan = await db.getArtisanById(booking.artisanId);
        if (!artisan) throw new TRPCError({ code: "NOT_FOUND" });
        // Only artisan or customer can update
        if (artisan.userId !== ctx.user.id && booking.customerId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        await db.updateBooking(input.id, { status: input.status, disputeReason: input.disputeReason });
        if (input.status === "disputed") {
          await notifyOwner({
            title: "Booking Dispute",
            content: `A dispute has been raised for booking #${input.id}. Reason: ${input.disputeReason ?? "Not specified"}`,
          });
        }
        return { success: true };
      }),
  }),

  // ─── Chat ────────────────────────────────────────────────────────────────────
  chat: router({
    getOrCreateConversation: protectedProcedure
      .input(z.object({ artisanId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const artisan = await db.getArtisanById(input.artisanId);
        if (!artisan) throw new TRPCError({ code: "NOT_FOUND" });
        const convo = await db.getOrCreateConversation(ctx.user.id, input.artisanId);
        return convo;
      }),

    myConversations: protectedProcedure.query(({ ctx }) => db.getConversationsByUser(ctx.user.id)),

    messages: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(({ input }) => db.getMessagesByConversation(input.conversationId)),

    sendMessage: protectedProcedure
      .input(
        z.object({
          conversationId: z.number(),
          content: z.string().min(1),
          messageType: z.enum(["text", "image", "booking_request"]).default("text"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await db.createMessage({ ...input, senderId: ctx.user.id });
        return { success: true };
      }),

    markRead: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .mutation(({ ctx, input }) => db.markMessagesRead(input.conversationId, ctx.user.id)),
  }),

  // ─── Notifications ───────────────────────────────────────────────────────────
  notifications: router({
    list: protectedProcedure.query(({ ctx }) => db.getNotificationsByUser(ctx.user.id)),
    unreadCount: protectedProcedure.query(({ ctx }) => db.getUnreadNotificationCount(ctx.user.id)),
    markRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.markNotificationRead(input.id)),
    markAllRead: protectedProcedure.mutation(({ ctx }) => db.markAllNotificationsRead(ctx.user.id)),
  }),

  // ─── Admin ───────────────────────────────────────────────────────────────────
  admin: router({
    stats: adminProcedure.query(async () => {
      const [allUsers, allArtisans, allBookings, allReviews] = await Promise.all([
        db.getAllUsers(1000),
        db.getAllArtisansAdmin(1000),
        db.getAllBookingsAdmin(1000),
        db.getAllReviewsAdmin(1000),
      ]);
      return {
        totalUsers: allUsers.length,
        totalArtisans: allArtisans.length,
        pendingArtisans: allArtisans.filter((a) => a.status === "pending").length,
        approvedArtisans: allArtisans.filter((a) => a.status === "approved").length,
        totalBookings: allBookings.length,
        totalReviews: allReviews.length,
        flaggedReviews: allReviews.filter((r) => r.status === "flagged").length,
      };
    }),

    users: adminProcedure
      .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }))
      .query(({ input }) => db.getAllUsers(input.limit, input.offset)),

    artisans: adminProcedure
      .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }))
      .query(({ input }) => db.getAllArtisansAdmin(input.limit, input.offset)),

    approveArtisan: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.updateArtisan(input.id, { status: "approved", isVerified: true });
        return { success: true };
      }),

    rejectArtisan: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.updateArtisan(input.id, { status: "rejected" });
        return { success: true };
      }),

    suspendArtisan: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.updateArtisan(input.id, { status: "suspended" });
        return { success: true };
      }),

    reviews: adminProcedure
      .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }))
      .query(({ input }) => db.getAllReviewsAdmin(input.limit, input.offset)),

    updateReviewStatus: adminProcedure
      .input(z.object({ id: z.number(), status: z.enum(["published", "hidden", "flagged"]) }))
      .mutation(({ input }) => db.updateReviewStatus(input.id, input.status)),

    bookings: adminProcedure
      .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }))
      .query(({ input }) => db.getAllBookingsAdmin(input.limit, input.offset)),
  }),
});

export type AppRouter = typeof appRouter;
