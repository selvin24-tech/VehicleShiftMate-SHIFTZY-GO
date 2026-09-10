import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import passport from "passport";
import { storage } from "./storage";
import { requireAuth, requireAdmin } from "./auth";
import { hashPassword } from "./lib/password";
import * as cashfree from "./lib/cashfree";
import Stripe from "stripe";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

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
  app.post("/api/user/register", async (req, res) => {
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
  app.post("/api/user/login", (req, res, next) => {
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

  // --- Shift Request Routes ---
  // Create a new shift request
  app.post("/api/shift-requests", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;

      // In a real app, we would get the vehicle ID from the request body
      // and verify that the vehicle belongs to the user
      // For simplicity, we'll use the first vehicle belonging to the user
      const userVehicles = await storage.getVehiclesByUserId(userId);
      
      if (userVehicles.length === 0) {
        return res.status(400).json({ message: "User has no vehicles" });
      }
      
      // Map from request body to our schema
      const requestData = {
        userId,
        vehicleId: userVehicles[0].id,
        pickupLocation: req.body.pickupLocation,
        dropLocation: req.body.dropLocation,
        insuranceExpiryDate: req.body.insuranceExpiryDate,
        vehiclePhoto: req.body.photoUploaded ? "vehicle-photo-url.jpg" : undefined,
        status: "pending",
      };
      
      const validatedData = insertShiftRequestSchema.parse(requestData);
      const newRequest = await storage.createShiftRequest(validatedData);
      
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
  // Customer creates a new enquiry
  app.post("/api/enquiries", async (req, res) => {
    try {
      const data = insertEnquirySchema.parse(req.body);
      const enquiry = await storage.createEnquiry(data);
      res.status(201).json(enquiry);
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
          return { ...e, messageCount: messages.length, lastMessage: messages[messages.length - 1] };
        })
      );
      res.json(withMeta);
    } catch (error) {
      console.error("Error fetching enquiries:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get a single enquiry's message thread
  app.get("/api/enquiries/:id/messages", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const enquiry = await storage.getEnquiry(id);
      if (!enquiry) return res.status(404).json({ message: "Enquiry not found" });
      const messages = await storage.getEnquiryMessages(id);
      res.json({ enquiry, messages });
    } catch (error) {
      console.error("Error fetching enquiry messages:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Add a message to an enquiry thread (customer, unauthenticated; or MD/admin)
  app.post("/api/enquiries/:id/messages", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const enquiry = await storage.getEnquiry(id);
      if (!enquiry) return res.status(404).json({ message: "Enquiry not found" });

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

  // WebSocket server for real-time chat
  // --- Payment Routes ---
  // Create a payment intent for vehicle booking
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { vehicleId, totalDays, totalAmount } = req.body;
      
      if (!vehicleId || !totalDays || !totalAmount) {
        return res.status(400).json({ message: "Missing required booking information" });
      }
      
      // Create a payment intent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100), // Convert to cents
        currency: "inr",
        metadata: {
          vehicleId: vehicleId.toString(),
          totalDays: totalDays.toString()
        }
      });
      
      // Send the client secret to the client
      res.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Error creating payment intent" });
    }
  });
  
  // Confirm a booking after successful payment
  app.post("/api/confirm-booking", requireAuth, async (req, res) => {
    try {
      const { paymentIntentId, vehicleId, pickupDate, returnDate, totalDays, totalAmount } = req.body;
      const userId = req.user!.id;

      // Verify payment was successful
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== "succeeded") {
        return res.status(400).json({ message: "Payment not completed" });
      }
      
      // Create a new trip/booking record
      const tripData = {
        userId,
        vehicleId: parseInt(vehicleId),
        driverId: userId, // In a real app, this could be different from userId
        pickupDate: new Date(pickupDate).toISOString(),
        returnDate: new Date(returnDate).toISOString(),
        totalDays: parseInt(totalDays),
        totalAmount: parseFloat(totalAmount),
        paymentId: paymentIntentId,
        status: "confirmed"
      };
      
      // Create the trip in database - Using a mock response for now
      // const newTrip = await storage.createTrip(tripData);
      const mockTrip = {
        id: Math.floor(Math.random() * 10000),
        ...tripData,
        createdAt: new Date().toISOString()
      };
      
      res.status(201).json(mockTrip);
    } catch (error) {
      console.error("Error confirming booking:", error);
      res.status(500).json({ message: "Error confirming booking" });
    }
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
      res.json(updated);
    } catch (error) {
      console.error("Error rejecting shift request:", error);
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
      const trip = await storage.getTrip(id);
      if (!trip) return res.status(404).json({ message: "Trip not found" });

      const updated = await storage.updateTripStatus(id, status);
      res.json(updated);
    } catch (error) {
      console.error("Error updating trip status:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store active connections
  const clients = new Map<number, WebSocket>();
  
  wss.on('connection', (ws) => {
    let userId: number | null = null;
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle authentication message
        if (data.type === 'auth') {
          userId = parseInt(data.userId);
          clients.set(userId, ws);
          ws.send(JSON.stringify({ type: 'auth', success: true }));
          return;
        }
        
        // If not authenticated, reject other message types
        if (!userId) {
          ws.send(JSON.stringify({ type: 'error', message: 'Not authenticated' }));
          return;
        }
        
        // Handle chat message
        if (data.type === 'message') {
          const messageData = insertChatMessageSchema.parse({
            conversationId: data.conversationId,
            senderId: userId,
            recipientId: data.recipientId,
            message: data.message
          });
          
          // Store message in database
          const savedMessage = await storage.sendChatMessage(messageData);
          
          // Send to recipient if online
          const recipientWs = clients.get(data.recipientId);
          if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
            recipientWs.send(JSON.stringify({
              type: 'message',
              message: savedMessage
            }));
          }
          
          // Confirm to sender
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
      if (userId) {
        clients.delete(userId);
      }
    });
  });
  
  return httpServer;
}
