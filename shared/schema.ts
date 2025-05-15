import { pgTable, text, serial, timestamp, varchar, boolean, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  phone: varchar("phone", { length: 15 }),
  avatarUrl: text("avatar_url"),
  isVerified: boolean("is_verified").default(false),
  address: text("address"),
  // Rating fields for the user
  averageRating: real("average_rating").default(0),
  totalRatings: integer("total_ratings").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id),
  type: text("type").notNull(), // car or bike
  make: text("make").notNull(),
  model: text("model").notNull(),
  registrationNumber: text("registration_number").notNull(),
  color: text("color"),
  fuelType: text("fuel_type"),
  seatingCapacity: text("seating_capacity"),
  image: text("image"),
  forRent: boolean("for_rent").default(false),
  pricePerDay: text("price_per_day"),
  // Rating fields for the vehicle
  averageRating: real("average_rating").default(0),
  totalRatings: integer("total_ratings").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const shiftRequests = pgTable("shift_requests", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id),
  vehicleId: serial("vehicle_id").references(() => vehicles.id),
  pickupLocation: text("pickup_location").notNull(),
  dropLocation: text("drop_location").notNull(),
  requestDate: timestamp("request_date").defaultNow(),
  insuranceExpiryDate: text("insurance_expiry_date").notNull(),
  vehiclePhoto: text("vehicle_photo"),
  status: text("status").default("pending"), // pending, approved, in-transit, completed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
});

export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  shiftRequestId: serial("shift_request_id").references(() => shiftRequests.id),
  driverId: serial("driver_id").references(() => users.id),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  price: text("price").notNull(),
  distance: text("distance"),
  status: text("status").default("pending"), // pending, in-transit, completed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
});

// Renamed from testimonials to userReviews to better reflect purpose
export const userReviews = pgTable("user_reviews", {
  id: serial("id").primaryKey(),
  reviewedUserId: integer("reviewed_user_id").references(() => users.id).notNull(),
  reviewerId: integer("reviewer_id").references(() => users.id).notNull(),
  tripId: integer("trip_id").references(() => trips.id).notNull(),
  rating: integer("rating").notNull(), // 1-5 star rating
  comment: text("comment"),
  userType: text("user_type").notNull(), // 'driver' or 'owner'
  createdAt: timestamp("created_at").defaultNow(),
});

// New table for vehicle reviews
export const vehicleReviews = pgTable("vehicle_reviews", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").references(() => vehicles.id).notNull(),
  reviewerId: integer("reviewer_id").references(() => users.id).notNull(),
  tripId: integer("trip_id").references(() => trips.id).notNull(),
  rating: integer("rating").notNull(), // 1-5 star rating
  comfort: integer("comfort").notNull(), // 1-5 rating for comfort
  cleanliness: integer("cleanliness").notNull(), // 1-5 rating for cleanliness
  performance: integer("performance").notNull(), // 1-5 rating for performance
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, averageRating: true, totalRatings: true });
export const insertVehicleSchema = createInsertSchema(vehicles).omit({ id: true, createdAt: true, averageRating: true, totalRatings: true });
export const insertShiftRequestSchema = createInsertSchema(shiftRequests).omit({ id: true, createdAt: true });
export const insertTripSchema = createInsertSchema(trips).omit({ id: true, createdAt: true });
export const insertUserReviewSchema = createInsertSchema(userReviews).omit({ id: true, createdAt: true });
export const insertVehicleReviewSchema = createInsertSchema(vehicleReviews).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;

export type ShiftRequest = typeof shiftRequests.$inferSelect;
export type InsertShiftRequest = z.infer<typeof insertShiftRequestSchema>;

export type Trip = typeof trips.$inferSelect;
export type InsertTrip = z.infer<typeof insertTripSchema>;

export type UserReview = typeof userReviews.$inferSelect;
export type InsertUserReview = z.infer<typeof insertUserReviewSchema>;

export type VehicleReview = typeof vehicleReviews.$inferSelect;
export type InsertVehicleReview = z.infer<typeof insertVehicleReviewSchema>;

// Chat related schemas
export const chatConversations = pgTable("chat_conversations", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  shiftRequestId: integer("shift_request_id").references(() => shiftRequests.id).notNull(),
  tripId: integer("trip_id").references(() => trips.id),
  ownerId: integer("owner_id").references(() => users.id).notNull(),
  travelerId: integer("traveler_id").references(() => users.id).notNull(),
  status: text("status").default("active"),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow(),
  conversationId: integer("conversation_id").references(() => chatConversations.id).notNull(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  recipientId: integer("recipient_id").references(() => users.id).notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
});

export const insertChatConversationSchema = createInsertSchema(chatConversations, {
  shiftRequestId: z.number(),
  ownerId: z.number(),
  travelerId: z.number(),
  tripId: z.number().optional(),
  status: z.string().optional()
});

export const insertChatMessageSchema = createInsertSchema(chatMessages, {
  conversationId: z.number(),
  senderId: z.number(),
  recipientId: z.number(),
  message: z.string(),
  isRead: z.boolean().optional()
});

export type ChatConversation = typeof chatConversations.$inferSelect;
export type InsertChatConversation = z.infer<typeof insertChatConversationSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
