import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import Stripe from "stripe";
import { 
  insertShiftRequestSchema, 
  insertUserReviewSchema,
  insertVehicleReviewSchema,
  insertUserSchema, 
  insertVehicleSchema,
  insertChatConversationSchema,
  insertChatMessageSchema,
  ChatMessage
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // --- User Routes ---
  // Get current user profile
  app.get("/api/user/profile", async (req, res) => {
    try {
      // In a real app, we would get the user ID from the session
      // For this prototype, we'll return the first user from the database
      const user = await storage.getUser(1);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get user's vehicles
      const vehicles = await storage.getVehiclesByUserId(user.id);
      
      // Get user's trips
      const trips = await storage.getTripsByUserId(user.id);
      
      // Return user profile with vehicles and trips
      res.json({
        ...user,
        password: undefined, // Don't return password
        vehicles,
        trips,
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Register a new user
  app.post("/api/user/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if email already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
      
      // Create user
      const newUser = await storage.createUser(userData);
      
      res.status(201).json({
        ...newUser,
        password: undefined, // Don't return password
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // --- Vehicle Routes ---
  // Get user's vehicles
  app.get("/api/vehicles", async (req, res) => {
    try {
      // In a real app, we would get the user ID from the session
      const userId = 1;
      
      const vehicles = await storage.getVehiclesByUserId(userId);
      res.json(vehicles);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Register a new vehicle
  app.post("/api/vehicles", async (req, res) => {
    try {
      // In a real app, we would get the user ID from the session
      const userId = 1;
      
      const vehicleData = insertVehicleSchema.parse({
        ...req.body,
        userId,
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
  app.post("/api/shift-requests", async (req, res) => {
    try {
      // In a real app, we would get the user ID from the session
      const userId = 1;
      
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

  // Get user's shift requests
  app.get("/api/shift-requests", async (req, res) => {
    try {
      // In a real app, we would get the user ID from the session
      const userId = 1;
      
      const requests = await storage.getShiftRequestsByUserId(userId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching shift requests:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // --- Review Routes ---
  // Create a new user review
  app.post("/api/user-reviews", async (req, res) => {
    try {
      // In a real app, we would get the user ID from the session
      const reviewerId = 1;
      
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
  app.post("/api/vehicle-reviews", async (req, res) => {
    try {
      // In a real app, we would get the user ID from the session
      const reviewerId = 1;
      
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
      
      // Get all vehicles that are marked for rent
      const allVehicles = Array.from((await storage.getVehicle(1) ? [1] : []))
        .map(async id => await storage.getVehicle(id))
        .filter(v => v && v.forRent);
      
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
  app.get("/api/chat/conversations", async (req, res) => {
    try {
      // In a real app, we would get the user ID from the session
      const userId = 1;
      
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
  app.get("/api/chat/conversations/:id/messages", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      
      // In a real app, we would get the user ID from the session
      const userId = 1;
      
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
  app.post("/api/chat/conversations", async (req, res) => {
    try {
      // In a real app, we would get the user ID from the session
      const userId = 1;
      
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
  
  // WebSocket server for real-time chat
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
