import { Server as SocketIOServer } from "socket.io";
import type { Server as HttpServer } from "http";
import * as db from "./db";

export function setupSocketIO(httpServer: HttpServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    path: "/api/socket.io",
  });

  // Map userId -> socketId for targeted delivery
  const userSockets = new Map<number, string>();

  io.on("connection", (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Authenticate user
    socket.on("authenticate", (userId: number) => {
      if (userId) {
        userSockets.set(userId, socket.id);
        socket.data.userId = userId;
        socket.join(`user:${userId}`);
        console.log(`[Socket.IO] User ${userId} authenticated`);
      }
    });

    // Join a conversation room
    socket.on("join_conversation", (conversationId: number) => {
      socket.join(`conversation:${conversationId}`);
    });

    // Leave a conversation room
    socket.on("leave_conversation", (conversationId: number) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // Send message
    socket.on(
      "send_message",
      async (data: {
        conversationId: number;
        content: string;
        senderId: number;
        messageType?: "text" | "image" | "booking_request";
      }) => {
        try {
          await db.createMessage({
            conversationId: data.conversationId,
            content: data.content,
            senderId: data.senderId,
            messageType: data.messageType ?? "text",
          });

          const message = {
            conversationId: data.conversationId,
            content: data.content,
            senderId: data.senderId,
            messageType: data.messageType ?? "text",
            createdAt: new Date(),
          };

          // Broadcast to all in the conversation room
          io.to(`conversation:${data.conversationId}`).emit("new_message", message);

          // Send push notification to recipient
          const convo = await db.getOrCreateConversation(0, 0); // placeholder
        } catch (err) {
          console.error("[Socket.IO] Error sending message:", err);
          socket.emit("error", { message: "Failed to send message" });
        }
      }
    );

    // Typing indicator
    socket.on("typing", (data: { conversationId: number; userId: number; isTyping: boolean }) => {
      socket.to(`conversation:${data.conversationId}`).emit("user_typing", {
        userId: data.userId,
        isTyping: data.isTyping,
      });
    });

    socket.on("disconnect", () => {
      if (socket.data.userId) {
        userSockets.delete(socket.data.userId);
      }
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}
