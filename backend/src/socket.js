const { Server } = require("socket.io");
const { verifyToken } = require("./services/auth.service");
const { FRONTEND_URL } = require("./config/env");
const Message = require("./models/message.model");
const User = require("./models/user.model");

// Track online users: userId -> Set<socketId>
const onlineUsers = new Map();

/**
 * Get a deterministic room name for two users (sorted IDs so both sides join the same room)
 */
const getRoomId = (userId1, userId2) => {
  return [userId1, userId2].sort().join("_");
};

/**
 * Initialize Socket.IO on the HTTP server.
 * 
 * Render-specific notes:
 * - Socket.IO is attached to the SAME http server (same port) — Render only exposes one port.
 * - transports include BOTH "polling" and "websocket" — Render supports WebSocket natively,
 *   but polling acts as a reliable fallback during cold starts or reconnection.
 * - CORS origins match the Express CORS config so handshake succeeds from the deployed frontend.
 */
const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const allowedOrigins = [
          FRONTEND_URL,
          "http://localhost:5173",
          "http://localhost:3000",
          "https://legal-gurdian.netlify.app",
        ];
        if (
          process.env.NODE_ENV !== "production" ||
          allowedOrigins.indexOf(origin) !== -1 ||
          origin.startsWith("http://localhost:") ||
          origin.startsWith("http://127.0.0.1:") ||
          origin.startsWith("http://10.0.2.2:") ||
          origin.startsWith("http://192.168.")
        ) {
          return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
    // Allow both transports — polling is the fallback for Render cold-start / proxy edge cases
    transports: ["polling", "websocket"],
    // Ping settings tuned for Render (free tier can be slow)
    pingInterval: 25000,
    pingTimeout: 20000,
    // Allow upgrades from polling to websocket
    allowUpgrades: true,
  });

  // ── JWT Authentication Middleware ──────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = verifyToken(token);
      const user = await User.findById(decoded.userId).select("_id name role");
      if (!user) {
        return next(new Error("User not found"));
      }

      // Attach user info to socket for later use
      socket.userId = user._id.toString();
      socket.userName = user.name;
      next();
    } catch (err) {
      console.error("Socket auth error:", err.message);
      next(new Error("Invalid or expired token"));
    }
  });

  // ── Connection Handler ────────────────────────────────────────────
  io.on("connection", (socket) => {
    const userId = socket.userId;
    console.log(`🔌 Socket connected: ${socket.userName} (${userId})`);

    // Track this socket in the online users map
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Broadcast that this user is online
    socket.broadcast.emit("user-online", { userId });

    // ── join-room ─────────────────────────────────────────────────
    socket.on("join-room", ({ recipientId }) => {
      if (!recipientId) return;
      const roomId = getRoomId(userId, recipientId);
      socket.join(roomId);
      console.log(`📥 ${socket.userName} joined room ${roomId}`);
    });

    // ── leave-room ────────────────────────────────────────────────
    socket.on("leave-room", ({ recipientId }) => {
      if (!recipientId) return;
      const roomId = getRoomId(userId, recipientId);
      socket.leave(roomId);
      console.log(`📤 ${socket.userName} left room ${roomId}`);
    });

    // ── send-message ──────────────────────────────────────────────
    socket.on("send-message", async ({ recipientId, message, messageType = "text", documentId = null, analysisContext = null }) => {
      // Validate recipient and sender
      if (!recipientId) {
        return socket.emit("message-error", { error: "Recipient ID is required" });
      }
      if (userId === recipientId) {
        return socket.emit("message-error", { error: "You cannot message yourself" });
      }

      // Validate message content
      const cleanMessage = message?.trim();
      const isText = messageType === "text";
      
      if (isText && !cleanMessage) {
        return socket.emit("message-error", { error: "Message content cannot be empty" });
      }
      if (cleanMessage && cleanMessage.length > 5000) {
        return socket.emit("message-error", { error: "Message is too long (max 5000 characters)" });
      }

      try {
        const sender = await User.findById(userId);
        const recipient = await User.findById(recipientId);

        if (!sender) {
          return socket.emit("message-error", { error: "Sender account not found" });
        }
        if (!recipient) {
          return socket.emit("message-error", { error: "Recipient account not found" });
        }

        // Validate roles: users can only message professionals, professionals can only message users
        if (sender.role === "user" && recipient.role !== "professional") {
          return socket.emit("message-error", { error: "Recipient must be a professional" });
        }

        // Validate document ownership if sharing analysis context
        if (messageType === "analysis_context") {
          if (!documentId) {
            return socket.emit("message-error", { error: "Document ID is required for sharing analysis context" });
          }
          const Document = require("./models/document.model");
          const document = await Document.findOne({ _id: documentId, userId });
          if (!document) {
            return socket.emit("message-error", { error: "Invalid document ID or unauthorized access" });
          }
        }

        // Save to database
        const newMessage = await Message.create({
          senderId: userId,
          recipientId,
          message: isText ? cleanMessage : "Shared an analysis context card",
          messageType,
          documentId,
          analysisContext,
        });

        const msgData = {
          _id: newMessage._id,
          senderId: userId,
          recipientId,
          message: newMessage.message,
          messageType: newMessage.messageType,
          documentId: newMessage.documentId,
          analysisContext: newMessage.analysisContext,
          read: false,
          createdAt: newMessage.createdAt,
        };

        // Send to both users in the room
        const roomId = getRoomId(userId, recipientId);
        io.to(roomId).emit("receive-message", msgData);

        // If recipient is not in the room but is online, still notify them
        const recipientSockets = onlineUsers.get(recipientId);
        if (recipientSockets) {
          recipientSockets.forEach((socketId) => {
            const recipientSocket = io.sockets.sockets.get(socketId);
            if (recipientSocket && !recipientSocket.rooms.has(roomId)) {
              recipientSocket.emit("receive-message", msgData);
            }
          });
        }
      } catch (err) {
        console.error("Error saving message:", err);
        socket.emit("message-error", { error: "Failed to send message due to a server error" });
      }
    });

    // ── typing ────────────────────────────────────────────────────
    socket.on("typing", ({ recipientId }) => {
      if (!recipientId) return;
      const roomId = getRoomId(userId, recipientId);
      socket.to(roomId).emit("user-typing", { userId, userName: socket.userName });
    });

    // ── stop-typing ───────────────────────────────────────────────
    socket.on("stop-typing", ({ recipientId }) => {
      if (!recipientId) return;
      const roomId = getRoomId(userId, recipientId);
      socket.to(roomId).emit("user-stop-typing", { userId });
    });

    // ── check-online ──────────────────────────────────────────────
    socket.on("check-online", ({ userIds }) => {
      if (!Array.isArray(userIds)) return;
      const statuses = {};
      userIds.forEach((id) => {
        statuses[id] = onlineUsers.has(id) && onlineUsers.get(id).size > 0;
      });
      socket.emit("online-statuses", statuses);
    });

    // ── mark-read ─────────────────────────────────────────────────
    socket.on("mark-read", async ({ senderId }) => {
      if (!senderId) return;

      try {
        const result = await Message.updateMany(
          { senderId, recipientId: userId, read: false },
          { $set: { read: true } }
        );

        if (result.modifiedCount > 0) {
          console.log(`✓ Marked ${result.modifiedCount} messages as read (from ${senderId} to ${userId})`);

          // Notify the sender that their messages were read
          // 1. Try the room first (if sender has the panel open with this user)
          const roomId = getRoomId(userId, senderId);
          socket.to(roomId).emit("messages-read", { readBy: userId });

          // 2. Also notify sender directly via their online sockets
          //    (in case they're online but not in this specific room)
          const senderSockets = onlineUsers.get(senderId);
          if (senderSockets) {
            senderSockets.forEach((socketId) => {
              const senderSocket = io.sockets.sockets.get(socketId);
              if (senderSocket) {
                senderSocket.emit("messages-read", { readBy: userId });
              }
            });
          }
        }
      } catch (err) {
        console.error("Error marking messages as read:", err);
      }
    });

    // ── disconnect ────────────────────────────────────────────────
    socket.on("disconnect", (reason) => {
      console.log(`🔌 Socket disconnected: ${socket.userName} (${reason})`);

      // Remove this socket from the user's set
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        // If no more sockets for this user, they are offline
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          socket.broadcast.emit("user-offline", { userId });
        }
      }
    });
  });

  console.log("✅ Socket.IO initialized");
  return io;
};

module.exports = { initSocket, onlineUsers };
