import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { 
  insertShiftRequestSchema, 
  insertTestimonialSchema, 
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

  // --- Testimonial Routes ---
  // Create a new testimonial
  app.post("/api/testimonials", async (req, res) => {
    try {
      // In a real app, we would get the user ID from the session
      const userId = 1;
      
      const testimonialData = insertTestimonialSchema.parse({
        ...req.body,
        userId,
      });
      
      const newTestimonial = await storage.createTestimonial(testimonialData);
      res.status(201).json(newTestimonial);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      console.error("Error creating testimonial:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get testimonials
  app.get("/api/testimonials", async (req, res) => {
    try {
      // In a real app, we would implement filtering
      // For simplicity, we'll just return the first few testimonials
      const allTestimonials = [];
      
      for (let i = 1; i <= 3; i++) {
        const testimonial = await storage.getTestimonial(i);
        if (testimonial) {
          allTestimonials.push(testimonial);
        }
      }
      
      res.json(allTestimonials);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
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

  const httpServer = createServer(app);
  return httpServer;
}
