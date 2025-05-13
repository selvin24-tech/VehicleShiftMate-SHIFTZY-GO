import { pgTable, text, serial, timestamp, varchar, boolean } from "drizzle-orm/pg-core";
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

export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id),
  tripId: serial("trip_id").references(() => trips.id),
  rating: text("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertVehicleSchema = createInsertSchema(vehicles).omit({ id: true, createdAt: true });
export const insertShiftRequestSchema = createInsertSchema(shiftRequests).omit({ id: true, createdAt: true });
export const insertTripSchema = createInsertSchema(trips).omit({ id: true, createdAt: true });
export const insertTestimonialSchema = createInsertSchema(testimonials).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;

export type ShiftRequest = typeof shiftRequests.$inferSelect;
export type InsertShiftRequest = z.infer<typeof insertShiftRequestSchema>;

export type Trip = typeof trips.$inferSelect;
export type InsertTrip = z.infer<typeof insertTripSchema>;

export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
