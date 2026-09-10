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
  // "customer" | "admin". Never settable via the public registration payload —
  // promotion to admin happens out-of-band (see scripts/promote-admin.ts).
  role: text("role").notNull().default("customer"),
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
  // pending -> approved (a Trip has been created) | rejected | cancelled.
  // "approved" is the only status that implies a linked trip exists.
  status: text("status").default("pending"),
  // Admin review audit trail (Phase 2 honest-pilot manual operations).
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  // Link back to the originating ShiftRequest. The ShiftRequest stays the
  // source / history record; the Trip references it and never replaces it.
  // A ShiftRequest has at most one Trip in V1.
  shiftRequestId: integer("shift_request_id").references(() => shiftRequests.id).notNull(),
  // V1: drivers are assigned manually by the admin and usually do not have
  // user accounts yet, so the assignment is captured as plain contact fields.
  // driverId is kept for the future when drivers become real users.
  driverId: integer("driver_id").references(() => users.id),
  driverName: text("driver_name"),
  driverPhone: text("driver_phone"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  price: text("price").notNull(),
  distance: text("distance"),
  notes: text("notes"),
  // OPERATIONAL lifecycle ONLY — never holds payment state (that lives on the
  // payments table). awaiting_payment -> scheduled -> in_transit -> completed | cancelled
  status: text("status").default("awaiting_payment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Real customer payments for the vehicle-shifting journey (Phase 2).
// One row per payment attempt against a Trip. Kept strictly separate from
// trip.status: a trip is "scheduled" once a payment row here reaches "paid".
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id").references(() => trips.id).notNull(),
  // Denormalised links so a payment can be traced to its request/customer
  // directly (history & admin queries) without walking the trip row.
  shiftRequestId: integer("shift_request_id").references(() => shiftRequests.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  amount: text("amount").notNull(),
  currency: text("currency").notNull().default("INR"),
  provider: text("provider").notNull().default("cashfree"),
  // Our own order id, sent to the gateway as order_id. Unique per attempt.
  providerOrderId: text("provider_order_id").notNull().unique(),
  cfOrderId: text("cf_order_id"),
  paymentSessionId: text("payment_session_id"),
  // PAYMENT lifecycle ONLY: created -> pending -> paid | failed | expired
  status: text("status").notNull().default("created"),
  method: text("method"),
  referenceId: text("reference_id"),
  rawStatus: text("raw_status"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, averageRating: true, totalRatings: true, role: true });
export const insertVehicleSchema = createInsertSchema(vehicles).omit({ id: true, createdAt: true, averageRating: true, totalRatings: true });
export const insertShiftRequestSchema = createInsertSchema(shiftRequests).omit({ id: true, createdAt: true, reviewedBy: true, reviewedAt: true, rejectionReason: true });
export const insertTripSchema = createInsertSchema(trips).omit({ id: true, createdAt: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true, updatedAt: true });
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

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

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

// Customer enquiries — direct line to the MD / Shiftzy support desk
export const enquiries = pgTable("enquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  pickup: text("pickup").notNull(),
  drop: text("drop").notNull(),
  vehicleType: text("vehicle_type").notNull(),
  preferredDate: text("preferred_date"),
  message: text("message").notNull(),
  status: text("status").default("new"), // new, in_progress, resolved
  createdAt: timestamp("created_at").defaultNow(),
});

export const enquiryMessages = pgTable("enquiry_messages", {
  id: serial("id").primaryKey(),
  enquiryId: integer("enquiry_id").references(() => enquiries.id).notNull(),
  sender: text("sender").notNull(), // 'customer' | 'md'
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEnquirySchema = createInsertSchema(enquiries, {
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(6, "A valid phone number is required"),
  pickup: z.string().min(1, "Pickup is required"),
  drop: z.string().min(1, "Drop is required"),
  vehicleType: z.string().min(1, "Vehicle type is required"),
  preferredDate: z.string().min(1, "Preferred date & time is required"),
  message: z.string().min(1, "Please type your question"),
}).omit({ id: true, createdAt: true, status: true });

export const insertEnquiryMessageSchema = createInsertSchema(enquiryMessages, {
  enquiryId: z.number(),
  sender: z.enum(["customer", "md"]),
  message: z.string().min(1),
}).omit({ id: true, createdAt: true });

export type Enquiry = typeof enquiries.$inferSelect;
export type InsertEnquiry = z.infer<typeof insertEnquirySchema>;
export type EnquiryMessage = typeof enquiryMessages.$inferSelect;
export type InsertEnquiryMessage = z.infer<typeof insertEnquiryMessageSchema>;
