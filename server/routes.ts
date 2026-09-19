import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import multer from "multer";
import rateLimit from "express-rate-limit";
import passport from "passport";
import { storage } from "./storage";
import { requireAuth, requireAdmin, resolveUserIdFromCookie } from "./auth";
import { hashPassword, verifyPassword, generateToken, hashToken } from "./lib/password";
import * as cashfree from "./lib/cashfree";
import * as email from "./lib/email";

// Basic abuse protection for the endpoints most attractive to brute-force /
// spam / enumeration: credential guessing, password-reset spam, and the
// unauthenticated public enquiry form. Keyed by IP (default) — fine for a
// single-region V1 pilot behind Render.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please wait a few minutes and try again." },
});
const publicWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please wait a few minutes and try again." },
});

// In-memory multipart parsing (files go straight into Postgres as bytea, no
// disk/tmp involved) — capped at 8MB per file, images + PDFs only.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /^image\/(jpeg|png|webp)$|^application\/pdf$/.test(file.mimetype);
    if (!ok) return cb(new Error("Only JPEG/PNG/WEBP images or PDF files are allowed"));
    cb(null, true);
  },
});

import {
  insertShiftRequestSchema,
  insertUserReviewSchema,
  insertVehicleReviewSchema,
  insertUserSchema,
  insertVehicleSchema,
  insertChatConversationSchema,
  insertChatMessageSchema,
  ChatMessage,
  insertEnquirySchema,
  insertEnquiryMessageSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // --- Auth routes ---
  // Register a new user, hash their password, and log them in (session created).
  app.post("/api/user/register", authLimiter, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);

      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }

      const newUser = await storage.createUser({
        ...userData,
        password: await hashPassword(userData.password),
      });
      const { password, ...safeUser } = newUser;

      req.login(safeUser, (error) => {
        if (error) {
          console.error("Error establishing session after registration:", error);
          return res.status(500).json({ message: "Server error" });
        }
        res.status(201).json(safeUser);
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Log in with email + password (passport-local, session-based)
  app.post("/api/user/login", authLimiter, (req, res, next) => {
    passport.authenticate(
      "local",
      (error: Error | null, user: Express.User | false, info: { message?: string } | undefined) => {
        if (error) return next(error);
        if (!user) return res.status(401).json({ message: info?.message ?? "Invalid email or password" });

        req.login(user, (loginError) => {
          if (loginError) return next(loginError);
          res.json(user);
        });
      }
    )(req, res, next);
  });

  // Log out and destroy the session
  app.post("/api/user/logout", (req, res, next) => {
    req.logout((error) => {
      if (error) return next(error);
      req.session.destroy((destroyError) => {
        if (destroyError) return next(destroyError);
        res.clearCookie("connect.sid");
        res.status(204).end();
      });
    });
  });

  // Get the currently logged-in user's profile
  app.get("/api/user/profile", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.user!.id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const vehicles = await storage.getVehiclesByUserId(user.id);
      const trips = await storage.getTripsByUserId(user.id);

      const { password, ...safeUser } = user;
      res.json({ ...safeUser, vehicles, trips });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Who am I? (used by the client to restore session state)
  app.get("/api/user/me", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    res.json(req.user);
  });

  // Update the current user's own profile fields (name/phone/address). Never
  // accepts email/password/role here — those have their own dedicated,
  // more carefully-guarded endpoints.
  app.patch("/api/user/profile", requireAuth, async (req, res) => {
    try {
      const schema = z.object({
        name: z.string().trim().min(1).optional(),
        phone: z.string().trim().min(6).max(15).optional(),
        address: z.string().trim().optional(),
        avatarUrl: z.string().optional(),
      });
      const patch = schema.parse(req.body);
      const updated = await storage.updateUserProfile(req.user!.id, patch);
      if (!updated) return res.status(404).json({ message: "User not found" });
      const { password, ...safeUser } = updated;
      res.json(safeUser);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: error.errors });
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Change password while logged in — requires the current password.
  app.post("/api/user/change-password", authLimiter, requireAuth, async (req, res) => {
    try {
      const schema = z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(6, "Password must be at least 6 characters"),
      });
      const { currentPassword, newPassword } = schema.parse(req.body);

      const user = await storage.getUser(req.user!.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      const valid = await verifyPassword(currentPassword, user.password);
      if (!valid) return res.status(400).json({ message: "Current password is incorrect" });

      await storage.updateUserPassword(user.id, await hashPassword(newPassword));
      res.status(204).end();
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: error.errors });
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Request a password-reset email. Always responds with the same generic
  // message regardless of whether the email exists (standard anti-enumeration
  // practice) — but if the email service itself isn't configured, that is
  // reported honestly rather than pretending an email went out.
  app.post("/api/user/forgot-password", authLimiter, async (req, res) => {
    try {
      const { email: rawEmail } = z.object({ email: z.string().email() }).parse(req.body);

      if (!email.isConfigured()) {
        return res.status(503).json({
          message: "Password reset email is not configured on this deployment yet. Contact support directly.",
        });
      }

      const token = generateToken();
      const expires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      const user = await storage.setPasswordResetToken(rawEmail, hashToken(token), expires);

      if (user) {
        const resetUrl = `${cashfree.appBaseUrl()}/reset-password?token=${token}`;
        try {
          await email.sendPasswordResetEmail(user.email, resetUrl);
        } catch (e) {
          console.error("Failed to send password reset email:", e);
          return res.status(502).json({ message: "Could not send the reset email. Please try again shortly." });
        }
      }

      res.json({ message: "If that email is registered, a password reset link has been sent." });
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: error.errors });
      console.error("Error requesting password reset:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Complete a password reset using the token emailed above. Single-use.
  app.post("/api/user/reset-password", authLimiter, async (req, res) => {
    try {
      const { token, newPassword } = z
        .object({ token: z.string().min(1), newPassword: z.string().min(6, "Password must be at least 6 characters") })
        .parse(req.body);

      const user = await storage.getUserByValidResetTokenHash(hashToken(token));
      if (!user) {
        return res.status(400).json({ message: "This reset link is invalid or has expired. Request a new one." });
      }

      await storage.updateUserPassword(user.id, await hashPassword(newPassword));
      res.json({ message: "Your password has been reset. You can now sign in." });
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: error.errors });
      console.error("Error resetting password:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // --- Vehicle Routes ---
  // Get user's vehicles
  app.get("/api/vehicles", requireAuth, async (req, res) => {
    try {
      const vehicles = await storage.getVehiclesByUserId(req.user!.id);
      res.json(vehicles);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Register a new vehicle
  app.post("/api/vehicles", requireAuth, async (req, res) => {
    try {
      const vehicleData = insertVehicleSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });
      
      const newVehicle = await storage.createVehicle(vehicleData);
      res.status(201).json(newVehicle);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      console.error("Error registering vehicle:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // --- Document Routes (real file storage — vehicle photos, RC, DL, insurance) ---
  const ALLOWED_DOC_TYPES = ["vehicle_photo", "rc", "dl", "insurance", "avatar"] as const;

  // Upload a document. File bytes are stored directly in Postgres; only
  // metadata (never the bytes) is ever sent back in list responses.
  app.post("/api/documents", requireAuth, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No file uploaded" });

      const { type, vehicleId, shiftRequestId } = req.body as Record<string, string | undefined>;
      if (!type || !ALLOWED_DOC_TYPES.includes(type as (typeof ALLOWED_DOC_TYPES)[number])) {
        return res.status(400).json({ message: `type must be one of: ${ALLOWED_DOC_TYPES.join(", ")}` });
      }

      const doc = await storage.createDocument({
        userId: req.user!.id,
        vehicleId: vehicleId ? parseInt(vehicleId) : null,
        shiftRequestId: shiftRequestId ? parseInt(shiftRequestId) : null,
        type,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        data: req.file.buffer,
      });
      res.status(201).json(doc);
    } catch (error) {
      console.error("Error uploading document:", error);
      res.status(500).json({ message: (error as Error).message || "Server error" });
    }
  });

  // List the current user's documents (metadata only).
  app.get("/api/documents", requireAuth, async (req, res) => {
    try {
      res.json(await storage.getDocumentsByUserId(req.user!.id));
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Stream a document's actual bytes — ownership (or admin) checked.
  app.get("/api/documents/:id/file", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const doc = await storage.getDocumentWithData(id);
      if (!doc) return res.status(404).json({ message: "Document not found" });
      if (doc.userId !== req.user!.id && req.user!.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to view this document" });
      }
      res.setHeader("Content-Type", doc.mimeType);
      res.setHeader("Content-Disposition", `inline; filename="${doc.fileName}"`);
      res.send(doc.data);
    } catch (error) {
      console.error("Error fetching document file:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/documents/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const doc = await storage.getDocumentMeta(id);
      if (!doc) return res.status(404).json({ message: "Document not found" });
      if (doc.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to delete this document" });
      }
      await storage.deleteDocument(id);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // --- Notifications (real, DB-backed) ---
  app.get("/api/notifications", requireAuth, async (req, res) => {
    try {
      res.json(await storage.getNotificationsByUserId(req.user!.id));
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/notifications/unread-count", requireAuth, async (req, res) => {
    try {
      res.json({ count: await storage.getUnreadNotificationCount(req.user!.id) });
    } catch (error) {
      console.error("Error fetching unread notification count:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/notifications/:id/read", requireAuth, async (req, res) => {
    try {
      await storage.markNotificationRead(parseInt(req.params.id), req.user!.id);
      res.status(204).end();
    } catch (error) {
      console.error("Error marking notification read:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/notifications/read-all", requireAuth, async (req, res) => {
    try {
      await storage.markAllNotificationsRead(req.user!.id);
      res.status(204).end();
    } catch (error) {
      console.error("Error marking all notifications read:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // --- Real payment history ---
  app.get("/api/payments", requireAuth, async (req, res) => {
    try {
      res.json(await storage.getPaymentsByUserId(req.user!.id));
    } catch (error) {
      console.error("Error fetching payment history:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // --- Shift Request Routes ---
  // Create a new shift request
  app.post("/api/shift-requests", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;

      const { vehicleType, vehicleModel, registrationNumber } = req.body;
      if (!vehicleModel || !registrationNumber) {
        return res.status(400).json({ message: "vehicleModel and registrationNumber are required" });
      }

      // The shift-request wizard collects the vehicle's details directly (no
      // separate "add a vehicle" step exists in the UI), so reuse a vehicle
      // already on file with this registration number, or create one now.
      const userVehicles = await storage.getVehiclesByUserId(userId);
      const existingVehicle = userVehicles.find(
        (v) => v.registrationNumber.replace(/\s+/g, "").toUpperCase() ===
               String(registrationNumber).replace(/\s+/g, "").toUpperCase()
      );
      const vehicle = existingVehicle ?? await storage.createVehicle({
        userId,
        type: vehicleType || "car",
        make: vehicleModel,
        model: vehicleModel,
        registrationNumber,
      });

      // A real, previously-uploaded document id (from POST /api/documents),
      // not a boolean flag — the actual photo bytes are stored in Postgres.
      let vehiclePhotoRef: string | undefined;
      if (req.body.vehiclePhotoDocId) {
        const docId = parseInt(req.body.vehiclePhotoDocId);
        const doc = await storage.getDocumentMeta(docId);
        if (!doc || doc.userId !== userId) {
          return res.status(400).json({ message: "Invalid vehicle photo document" });
        }
        vehiclePhotoRef = `/api/documents/${docId}/file`;
      }

      // Map from request body to our schema
      const requestData = {
        userId,
        vehicleId: vehicle.id,
        pickupLocation: req.body.pickupLocation,
        dropLocation: req.body.dropLocation,
        insuranceExpiryDate: req.body.insuranceExpiryDate,
        vehiclePhoto: vehiclePhotoRef,
        status: "pending",
      };

      const validatedData = insertShiftRequestSchema.parse(requestData);
      const newRequest = await storage.createShiftRequest(validatedData);

      if (req.body.vehiclePhotoDocId) {
        await storage.linkDocumentToShiftRequest(parseInt(req.body.vehiclePhotoDocId), newRequest.id, vehicle.id);
      }

      res.status(201).json(newRequest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      console.error("Error creating shift request:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get user's shift requests, each enriched with its linked trip + payment
  // summary so the customer app can show "priced trip / pay now".
  app.get("/api/shift-requests", requireAuth, async (req, res) => {
    try {
      const requests = await storage.getShiftRequestsWithRelationsByUserId(req.user!.id);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching shift requests:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get a single shift request (with trip + payment), ownership-checked.
  app.get("/api/shift-requests/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const request = await storage.getShiftRequestWithRelations(id);
      if (!request) return res.status(404).json({ message: "Shift request not found" });
      if (request.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to view this request" });
      }
      res.json(request);
    } catch (error) {
      console.error("Error fetching shift request:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get a single trip (priced booking), ownership-checked (customer or driver).
  app.get("/api/trips/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const trip = await storage.getTripWithRelations(id);
      if (!trip) return res.status(404).json({ message: "Trip not found" });
      const isCustomer = trip.shiftRequest?.userId === req.user!.id;
      const isDriver = trip.driverId != null && trip.driverId === req.user!.id;
      if (!isCustomer && !isDriver && req.user!.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to view this trip" });
      }
      res.json(trip);
    } catch (error) {
      console.error("Error fetching trip:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // --- Review Routes ---
  // Create a new user review
  app.post("/api/user-reviews", requireAuth, async (req, res) => {
    try {
      const reviewerId = req.user!.id;

      const reviewData = insertUserReviewSchema.parse({
        ...req.body,
        reviewerId,
        reviewedUserId: parseInt(req.body.reviewedUserId),
        tripId: parseInt(req.body.tripId),
        rating: parseInt(req.body.rating)
      });
      
      const newReview = await storage.createUserReview(reviewData);
      res.status(201).json(newReview);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      console.error("Error creating user review:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Create a new vehicle review
  app.post("/api/vehicle-reviews", requireAuth, async (req, res) => {
    try {
      const reviewerId = req.user!.id;

      const reviewData = insertVehicleReviewSchema.parse({
        ...req.body,
        reviewerId,
        vehicleId: parseInt(req.body.vehicleId),
        tripId: parseInt(req.body.tripId),
        rating: parseInt(req.body.rating),
        comfort: parseInt(req.body.comfort || "0"),
        cleanliness: parseInt(req.body.cleanliness || "0"),
        performance: parseInt(req.body.performance || "0")
      });
      
      const newReview = await storage.createVehicleReview(reviewData);
      res.status(201).json(newReview);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      console.error("Error creating vehicle review:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get user reviews for a specific user
  app.get("/api/user-reviews/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const userReviews = await storage.getUserReviewsByReviewedUserId(userId);
      res.json(userReviews);
    } catch (error) {
      console.error("Error fetching user reviews:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Get vehicle reviews for a specific vehicle
  app.get("/api/vehicle-reviews/:vehicleId", async (req, res) => {
    try {
      const vehicleId = parseInt(req.params.vehicleId);
      const vehicleReviews = await storage.getVehicleReviewsByVehicleId(vehicleId);
      res.json(vehicleReviews);
    } catch (error) {
      console.error("Error fetching vehicle reviews:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // --- Available Vehicles Routes ---
  // Get available vehicles for travel
  app.get("/api/available-vehicles", async (req, res) => {
    try {
      // In a real app, we would query vehicles marked as available for rent
      // and implement filtering by location, vehicle type, etc.
      // For this prototype, we'll return a predefined list
      
      // Simulate available vehicles
      const availableVehicles = [
        {
          id: 101,
          type: "car",
          make: "Toyota",
          model: "Innova",
          registrationNumber: "TN 05 XY 7890",
          fuelType: "Diesel",
          seatingCapacity: "7",
          image: "https://images.unsplash.com/photo-1550355291-bbee04a92027",
          ownerName: "Ramu S.",
          rating: "4.7",
          availabilityStatus: "available",
          features: ["AC", "Available Now"],
          pricePerDay: "3500"
        },
        {
          id: 102,
          type: "bike",
          make: "Royal Enfield",
          model: "Himalayan",
          registrationNumber: "TN 10 AB 4321",
          fuelType: "Petrol",
          image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf",
          ownerName: "Janu K.",
          rating: "4.5",
          availabilityStatus: "available-tomorrow",
          features: ["Adventure", "Available Tomorrow"],
          pricePerDay: "1200"
        },
        {
          id: 103,
          type: "car",
          make: "Hyundai",
          model: "Creta",
          registrationNumber: "TN 02 CD 5678",
          fuelType: "Petrol",
          seatingCapacity: "5",
          image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738",
          ownerName: "Priya M.",
          rating: "4.9",
          availabilityStatus: "available",
          features: ["Premium", "Available Now"],
          pricePerDay: "2800"
        }
      ];
      
      // Apply filters if provided
      let filtered = availableVehicles;
      
      if (req.query.type) {
        filtered = filtered.filter(v => v.type === req.query.type);
      }
      
      if (req.query.search) {
        const search = (req.query.search as string).toLowerCase();
        filtered = filtered.filter(v => 
          v.make.toLowerCase().includes(search) || 
          v.model.toLowerCase().includes(search)
        );
      }
      
      res.json(filtered);
    } catch (error) {
      console.error("Error fetching available vehicles:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // --- Chat Routes ---
  // Get conversations for a user
  app.get("/api/chat/conversations", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;

      const conversations = await storage.getChatConversationsByUserId(userId);
      
      // Enhance conversations with additional info
      const enhancedConversations = await Promise.all(conversations.map(async (conversation) => {
        const messages = await storage.getChatMessages(conversation.id);
        const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
        
        // Get the other user (not the current user)
        const otherUserId = conversation.ownerId === userId ? conversation.travelerId : conversation.ownerId;
        const otherUser = await storage.getUser(otherUserId);
        
        return {
          ...conversation,
          lastMessage,
          otherUser: otherUser ? {
            id: otherUser.id,
            name: otherUser.name,
            avatarUrl: otherUser.avatarUrl
          } : null,
          unreadCount: messages.filter(m => m.recipientId === userId && !m.isRead).length
        };
      }));
      
      res.json(enhancedConversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Get messages for a conversation
  app.get("/api/chat/conversations/:id/messages", requireAuth, async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const userId = req.user!.id;

      // Verify the user is part of the conversation
      const conversation = await storage.getChatConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      if (conversation.ownerId !== userId && conversation.travelerId !== userId) {
        return res.status(403).json({ message: "Not authorized to view this conversation" });
      }
      
      const messages = await storage.getChatMessages(conversationId);
      
      // Mark messages as read
      await storage.markMessagesAsRead(conversationId, userId);
      
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Create a new conversation
  app.post("/api/chat/conversations", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;

      const conversationData = insertChatConversationSchema.parse({
        ...req.body,
        ownerId: userId
      });
      
      // Check if a conversation already exists between these users
      const existingConversations = await storage.getChatConversationsByUserId(userId);
      const existingConversation = existingConversations.find(
        c => (c.ownerId === userId && c.travelerId === conversationData.travelerId) || 
             (c.travelerId === userId && c.ownerId === conversationData.travelerId)
      );
      
      if (existingConversation) {
        return res.status(200).json(existingConversation);
      }
      
      const newConversation = await storage.createChatConversation(conversationData);
      res.status(201).json(newConversation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      console.error("Error creating conversation:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // --- Customer Enquiry (MD support desk) Routes ---
  // Customer creates a new enquiry — no account required (intentional low-
  // friction contact form). A one-time, unguessable access token is minted
  // and returned ONLY in this response; the client must hold onto it to read
  // or reply to this thread later. Only its SHA-256 hash is stored.
  app.post("/api/enquiries", publicWriteLimiter, async (req, res) => {
    try {
      const data = insertEnquirySchema.parse(req.body);
      const accessToken = generateToken();
      const enquiry = await storage.createEnquiry(data, hashToken(accessToken));
      const { accessTokenHash, ...safeEnquiry } = enquiry;
      res.status(201).json({ ...safeEnquiry, accessToken });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      console.error("Error creating enquiry:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // List all enquiries (MD / admin inbox)
  app.get("/api/enquiries", requireAdmin, async (_req, res) => {
    try {
      const enquiries = await storage.getEnquiries();
      const withMeta = await Promise.all(
        enquiries.map(async (e) => {
          const messages = await storage.getEnquiryMessages(e.id);
          const { accessTokenHash, ...safe } = e;
          return { ...safe, messageCount: messages.length, lastMessage: messages[messages.length - 1] };
        })
      );
      res.json(withMeta);
    } catch (error) {
      console.error("Error fetching enquiries:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // An admin can read any thread; anyone else must present the access token
  // handed out at creation (as `?token=` or `x-enquiry-token` header) — this
  // closes the previous "guess the id" PII exposure.
  function canAccessEnquiry(req: import("express").Request, enquiry: { accessTokenHash: string | null }): boolean {
    if (req.isAuthenticated() && req.user.role === "admin") return true;
    if (!enquiry.accessTokenHash) return false; // legacy row, minted before tokens existed
    const supplied = (req.query.token as string | undefined) || req.header("x-enquiry-token");
    return Boolean(supplied) && hashToken(supplied!) === enquiry.accessTokenHash;
  }

  // Get a single enquiry's message thread
  app.get("/api/enquiries/:id/messages", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const enquiry = await storage.getEnquiry(id);
      if (!enquiry) return res.status(404).json({ message: "Enquiry not found" });
      if (!canAccessEnquiry(req, enquiry)) {
        return res.status(403).json({ message: "Not authorized to view this enquiry" });
      }
      const { accessTokenHash, ...safeEnquiry } = enquiry;
      const messages = await storage.getEnquiryMessages(id);
      res.json({ enquiry: safeEnquiry, messages });
    } catch (error) {
      console.error("Error fetching enquiry messages:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Add a message to an enquiry thread (token-holding customer, or admin as "md")
  app.post("/api/enquiries/:id/messages", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const enquiry = await storage.getEnquiry(id);
      if (!enquiry) return res.status(404).json({ message: "Enquiry not found" });
      if (!canAccessEnquiry(req, enquiry)) {
        return res.status(403).json({ message: "Not authorized to post to this enquiry" });
      }

      // Only an authenticated admin may post as "md" — everyone else can only
      // post as "customer", regardless of what the request body claims.
      const isAdminCaller = req.isAuthenticated() && req.user.role === "admin";
      const sender = isAdminCaller ? req.body.sender : "customer";

      const data = insertEnquiryMessageSchema.parse({ ...req.body, sender, enquiryId: id });
      const message = await storage.addEnquiryMessage(data);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      console.error("Error adding enquiry message:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Update enquiry status (MD / admin)
  app.patch("/api/enquiries/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      if (!status) return res.status(400).json({ message: "Status is required" });
      const updated = await storage.updateEnquiryStatus(id, status);
      if (!updated) return res.status(404).json({ message: "Enquiry not found" });
      res.json(updated);
    } catch (error) {
      console.error("Error updating enquiry:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // --- Retired legacy Stripe/mock booking path ---
  // These endpoints predate the real Cashfree flow below and never fully
  // persisted a booking (confirm-booking returned a fabricated, non-DB trip
  // object). Cashfree is the only real V1 payment path. Kept as permanent
  // 410s (rather than deleted) so any stale client build fails loudly and
  // honestly instead of silently fabricating a "successful" booking.
  app.post("/api/create-payment-intent", (_req, res) => {
    res.status(410).json({ message: "This payment path has been retired. Use the Cashfree trip-payment flow." });
  });
  app.post("/api/confirm-booking", (_req, res) => {
    res.status(410).json({ message: "This payment path has been retired. Use the Cashfree trip-payment flow." });
  });

  // ─────────────────────────────────────────────────────────────────────
  //  PHASE 2 — real vehicle-shifting business flow
  //  ShiftRequest → Admin review (price + driver) → Trip → Cashfree payment
  // ─────────────────────────────────────────────────────────────────────

  const ALLOWED_TRIP_STATUS = [
    "awaiting_payment",
    "scheduled",
    "in_transit",
    "completed",
    "cancelled",
  ] as const;

  const approveSchema = z.object({
    price: z
      .union([z.string(), z.number()])
      .transform((v) => String(v).trim())
      .refine((v) => Number(v) > 0, "Price must be a number greater than 0"),
    driverName: z.string().trim().min(1).optional(),
    driverPhone: z.string().trim().min(1).optional(),
    distance: z.string().trim().min(1).optional(),
    notes: z.string().trim().min(1).optional(),
    startDate: z.string().trim().min(1).optional(),
    endDate: z.string().trim().min(1).optional(),
  });

  const toDate = (v?: string): Date | null => {
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  };

  /**
   * Reconcile a Cashfree order against our payments row using the authoritative
   * server-side "Get Order" API. Only this function moves a payment to "paid",
   * and it is idempotent — safe to call from both the return-redirect verify
   * endpoint and the webhook.
   */
  async function reconcileCashfreeOrder(providerOrderId: string) {
    const payment = await storage.getPaymentByProviderOrderId(providerOrderId);
    if (!payment) return undefined;
    if (payment.status === "paid") return payment;

    const order = await cashfree.getOrder(providerOrderId);
    const raw = order.order_status ?? null;
    const status = (order.order_status || "").toUpperCase();

    if (status === "PAID") {
      let method: string | undefined;
      let referenceId: string | undefined;
      try {
        const pays = await cashfree.getOrderPayments(providerOrderId);
        const ok =
          pays.find((p) => (p.payment_status || "").toUpperCase() === "SUCCESS") || pays[0];
        method = (ok?.payment_group as string | undefined) || undefined;
        referenceId =
          ok?.cf_payment_id != null
            ? String(ok.cf_payment_id)
            : (ok?.bank_reference as string | undefined) || undefined;
      } catch (e) {
        console.error("Cashfree payment-detail lookup failed (non-fatal):", e);
      }

      const updated = await storage.updatePayment(payment.id, {
        status: "paid",
        cfOrderId: order.cf_order_id != null ? String(order.cf_order_id) : payment.cfOrderId,
        method: method ?? payment.method,
        referenceId: referenceId ?? payment.referenceId,
        rawStatus: raw,
        paidAt: new Date(),
      });

      // Operational side-effect only: awaiting_payment → scheduled.
      const trip = await storage.getTrip(payment.tripId);
      if (trip && trip.status === "awaiting_payment") {
        await storage.updateTripStatus(trip.id, "scheduled");
      }

      await storage.createNotification({
        userId: payment.userId,
        type: "payment_paid",
        title: "Payment successful",
        body: `Your payment of ₹${payment.amount} was received. Your trip is now scheduled.`,
        relatedId: payment.tripId,
      });

      return updated;
    }

    const mapped =
      status === "EXPIRED"
        ? "expired"
        : status === "TERMINATED" || status === "TERMINATION_REQUESTED"
        ? "failed"
        : payment.status === "created"
        ? "pending"
        : payment.status;

    if (mapped !== payment.status || raw !== payment.rawStatus) {
      return storage.updatePayment(payment.id, { status: mapped, rawStatus: raw });
    }
    return payment;
  }

  // Customer: create (or reuse) a Cashfree order for a priced trip.
  app.post("/api/payments/cashfree/order", requireAuth, async (req, res) => {
    try {
      const tripId = parseInt(req.body.tripId);
      if (!tripId) return res.status(400).json({ message: "tripId is required" });

      const trip = await storage.getTripWithRelations(tripId);
      if (!trip) return res.status(404).json({ message: "Trip not found" });
      if (trip.shiftRequest?.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to pay for this trip" });
      }

      const amount = Number(trip.price);
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "This trip has no valid price yet" });
      }

      const existing = await storage.getLatestPaymentForTrip(tripId);
      if (existing?.status === "paid") {
        return res.status(409).json({ message: "This trip is already paid" });
      }

      if (!cashfree.isConfigured()) {
        return res.status(503).json({
          message:
            "Payment gateway is not configured. Add CASHFREE_APP_ID and CASHFREE_SECRET_KEY (sandbox) to the server environment.",
        });
      }

      // A fresh order id per attempt keeps Cashfree order ids unique.
      const providerOrderId = `SHIFTZY-${tripId}-${Date.now().toString(36)}`;
      const returnUrl = `${cashfree.appBaseUrl()}/trip-payment/${tripId}?order_id={order_id}`;
      const notifyUrl = `${cashfree.appBaseUrl()}/api/webhooks/cashfree`;

      let order;
      try {
        order = await cashfree.createOrder({
          orderId: providerOrderId,
          amount,
          currency: "INR",
          customer: {
            id: `user_${req.user!.id}`,
            name: trip.customer?.name,
            email: trip.customer?.email,
            phone: trip.customer?.phone,
          },
          returnUrl,
          notifyUrl,
        });
      } catch (e) {
        console.error("Cashfree createOrder failed:", e);
        return res.status(502).json({ message: "Could not reach the payment gateway. Please try again." });
      }

      await storage.createPayment({
        tripId,
        shiftRequestId: trip.shiftRequestId,
        userId: req.user!.id,
        amount: String(amount),
        currency: "INR",
        provider: "cashfree",
        providerOrderId,
        cfOrderId: order.cf_order_id != null ? String(order.cf_order_id) : null,
        paymentSessionId: order.payment_session_id ?? null,
        status: "pending",
        rawStatus: order.order_status ?? null,
      });

      res.status(201).json({
        providerOrderId,
        paymentSessionId: order.payment_session_id,
        mode: cashfree.cashfreeMode(),
        amount,
      });
    } catch (error) {
      console.error("Error creating Cashfree order:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Customer: authoritative server-side verification after the checkout redirect.
  app.get("/api/payments/cashfree/verify/:providerOrderId", requireAuth, async (req, res) => {
    try {
      const providerOrderId = req.params.providerOrderId;
      const payment = await storage.getPaymentByProviderOrderId(providerOrderId);
      if (!payment) return res.status(404).json({ message: "Payment not found" });
      if (payment.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized" });
      }

      if (!cashfree.isConfigured()) {
        return res.status(503).json({ message: "Payment gateway is not configured" });
      }

      let reconciled = payment;
      try {
        reconciled = (await reconcileCashfreeOrder(providerOrderId)) ?? payment;
      } catch (e) {
        console.error("Cashfree verify failed:", e);
        return res.status(502).json({ message: "Could not verify payment with the gateway yet." });
      }

      const trip = await storage.getTrip(payment.tripId);
      res.json({
        paymentStatus: reconciled.status,
        tripStatus: trip?.status ?? null,
        amount: reconciled.amount,
        method: reconciled.method,
        referenceId: reconciled.referenceId,
        providerOrderId,
      });
    } catch (error) {
      console.error("Error verifying payment:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Cashfree webhook — backup confirmation path. Signature-verified against the
  // raw request body (captured in server/index.ts as req.rawBody).
  app.post("/api/webhooks/cashfree", async (req, res) => {
    try {
      const rawBody = (req as unknown as { rawBody?: Buffer }).rawBody?.toString() ?? "";
      const signature = req.header("x-webhook-signature");
      const timestamp = req.header("x-webhook-timestamp");

      if (!cashfree.verifyWebhookSignature(rawBody, signature, timestamp)) {
        return res.status(401).json({ message: "Invalid signature" });
      }

      const orderId: string | undefined =
        req.body?.data?.order?.order_id || req.body?.data?.order_id || req.body?.order_id;

      if (orderId) {
        try {
          await reconcileCashfreeOrder(orderId);
        } catch (e) {
          console.error("Webhook reconcile failed:", e);
        }
      }
      // Always 200 quickly so Cashfree does not retry a handled event.
      res.status(200).json({ received: true });
    } catch (error) {
      console.error("Error handling Cashfree webhook:", error);
      res.status(200).json({ received: true });
    }
  });

  // ── Admin: real shift-request approvals ──
  app.get("/api/admin/shift-requests", requireAdmin, async (_req, res) => {
    try {
      res.json(await storage.getAllShiftRequestsWithRelations());
    } catch (error) {
      console.error("Error fetching admin shift requests:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Admin: review a request — set the agreed price, assign a driver manually,
  // and create the linked Trip. This is the ONLY path that creates a Trip.
  app.post("/api/admin/shift-requests/:id/approve", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const request = await storage.getShiftRequest(id);
      if (!request) return res.status(404).json({ message: "Shift request not found" });
      if (request.status === "approved") {
        return res.status(409).json({ message: "This request is already approved" });
      }

      const data = approveSchema.parse(req.body);
      const { request: updatedRequest, trip } = await storage.approveShiftRequestAndCreateTrip(
        id,
        req.user!.id,
        {
          price: data.price,
          driverName: data.driverName ?? null,
          driverPhone: data.driverPhone ?? null,
          distance: data.distance ?? null,
          notes: data.notes ?? null,
          startDate: toDate(data.startDate),
          endDate: toDate(data.endDate),
        }
      );

      await storage.createNotification({
        userId: updatedRequest.userId,
        type: "request_approved",
        title: "Your shift request was approved",
        body: `Priced at ₹${trip.price}. Open My Rides to review and pay.`,
        relatedId: trip.id,
      });

      res.status(201).json({ request: updatedRequest, trip });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      console.error("Error approving shift request:", error);
      res.status(500).json({ message: (error as Error).message || "Server error" });
    }
  });

  app.post("/api/admin/shift-requests/:id/reject", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const reason = String(req.body.reason || "").trim();
      if (!reason) return res.status(400).json({ message: "A rejection reason is required" });

      const request = await storage.getShiftRequest(id);
      if (!request) return res.status(404).json({ message: "Shift request not found" });

      const existingTrip = await storage.getTripByShiftRequestId(id);
      if (existingTrip) {
        return res.status(409).json({ message: "Cannot reject — a trip already exists for this request" });
      }

      const updated = await storage.rejectShiftRequest(id, req.user!.id, reason);

      if (updated) {
        await storage.createNotification({
          userId: updated.userId,
          type: "request_rejected",
          title: "Your shift request was declined",
          body: reason,
          relatedId: updated.id,
        });
      }

      res.json(updated);
    } catch (error) {
      console.error("Error rejecting shift request:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // ── Admin: real aggregate summary for the Control Center overview ──
  app.get("/api/admin/summary", requireAdmin, async (_req, res) => {
    try {
      res.json(await storage.getAdminSummary());
    } catch (error) {
      console.error("Error fetching admin summary:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // ── Admin: real bookings (trips) with payment status ──
  app.get("/api/admin/bookings", requireAdmin, async (_req, res) => {
    try {
      res.json(await storage.getAllTripsWithRelations());
    } catch (error) {
      console.error("Error fetching admin bookings:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Admin: manual trip status update. Never touches payment status.
  app.post("/api/admin/trips/:id/status", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const status = String(req.body.status || "");
      if (!ALLOWED_TRIP_STATUS.includes(status as (typeof ALLOWED_TRIP_STATUS)[number])) {
        return res.status(400).json({
          message: `status must be one of: ${ALLOWED_TRIP_STATUS.join(", ")}`,
        });
      }
      const trip = await storage.getTripWithRelations(id);
      if (!trip) return res.status(404).json({ message: "Trip not found" });

      const updated = await storage.updateTripStatus(id, status);

      if (trip.shiftRequest?.userId) {
        const STATUS_LABEL: Record<string, string> = {
          scheduled: "Trip scheduled",
          in_transit: "Your vehicle is on the way",
          completed: "Trip completed",
          cancelled: "Trip cancelled",
        };
        await storage.createNotification({
          userId: trip.shiftRequest.userId,
          type: "trip_status",
          title: STATUS_LABEL[status] || "Trip status updated",
          body: `Trip #${id}: status changed to "${status.replace("_", " ")}".`,
          relatedId: id,
        });
      }

      res.json(updated);
    } catch (error) {
      console.error("Error updating trip status:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);
  const wss = new WebSocketServer({ noServer: true });

  // Store active connections, keyed by the SERVER-VERIFIED user id only.
  const clients = new Map<number, WebSocket>();

  // Authenticate the upgrade itself against the real session cookie (the
  // same Postgres-backed session store used by every HTTP route) — a client
  // can no longer declare who it is. Unauthenticated upgrades are rejected
  // before a WebSocket connection is ever established.
  httpServer.on("upgrade", async (req, socket, head) => {
    const url = new URL(req.url || "", "http://localhost");
    if (url.pathname !== "/ws") return; // let other upgrade handlers (e.g. Vite HMR) deal with it

    const userId = await resolveUserIdFromCookie(req.headers.cookie);
    if (!userId) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req, userId);
    });
  });

  wss.on('connection', (ws: WebSocket, _req: unknown, userId: number) => {
    clients.set(userId, ws);
    ws.send(JSON.stringify({ type: 'auth', success: true }));

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());

        // Handle chat message — conversation membership is verified against
        // the DB, and recipientId is derived from the conversation itself,
        // never trusted from the client.
        if (data.type === 'message') {
          const conversation = await storage.getChatConversation(parseInt(data.conversationId));
          if (!conversation) {
            ws.send(JSON.stringify({ type: 'error', message: 'Conversation not found' }));
            return;
          }
          if (conversation.ownerId !== userId && conversation.travelerId !== userId) {
            ws.send(JSON.stringify({ type: 'error', message: 'Not a participant in this conversation' }));
            return;
          }
          const recipientId = conversation.ownerId === userId ? conversation.travelerId : conversation.ownerId;

          const messageData = insertChatMessageSchema.parse({
            conversationId: conversation.id,
            senderId: userId,
            recipientId,
            message: data.message
          });

          const savedMessage = await storage.sendChatMessage(messageData);

          const recipientWs = clients.get(recipientId);
          if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
            recipientWs.send(JSON.stringify({
              type: 'message',
              message: savedMessage
            }));
          }

          ws.send(JSON.stringify({
            type: 'message_sent',
            message: savedMessage
          }));
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: error instanceof Error ? error.message : 'Unknown error'
        }));
      }
    });

    ws.on('close', () => {
      if (clients.get(userId) === ws) clients.delete(userId);
    });
  });
  
  return httpServer;
}
