import { eq, and, or, asc, desc } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  vehicles,
  shiftRequests,
  trips,
  userReviews,
  vehicleReviews,
  chatConversations,
  chatMessages,
  enquiries,
  enquiryMessages,
  User,
  InsertUser,
  Vehicle,
  InsertVehicle,
  ShiftRequest,
  InsertShiftRequest,
  Trip,
  InsertTrip,
  UserReview,
  InsertUserReview,
  VehicleReview,
  InsertVehicleReview,
  ChatConversation,
  InsertChatConversation,
  ChatMessage,
  InsertChatMessage,
  Enquiry,
  InsertEnquiry,
  EnquiryMessage,
  InsertEnquiryMessage
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserRating(userId: number, newRating: number): Promise<User | undefined>;

  // Vehicle operations
  getVehicle(id: number): Promise<Vehicle | undefined>;
  getVehiclesByUserId(userId: number): Promise<Vehicle[]>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: number, vehicle: Partial<Vehicle>): Promise<Vehicle | undefined>;
  updateVehicleRating(vehicleId: number, newRating: number): Promise<Vehicle | undefined>;

  // Shift request operations
  getShiftRequest(id: number): Promise<ShiftRequest | undefined>;
  getShiftRequestsByUserId(userId: number): Promise<ShiftRequest[]>;
  createShiftRequest(request: InsertShiftRequest): Promise<ShiftRequest>;
  updateShiftRequestStatus(id: number, status: string): Promise<ShiftRequest | undefined>;

  // Trip operations
  getTrip(id: number): Promise<Trip | undefined>;
  getTripsByUserId(userId: number): Promise<Trip[]>;
  getTripsByDriverId(driverId: number): Promise<Trip[]>;
  createTrip(trip: InsertTrip): Promise<Trip>;
  updateTripStatus(id: number, status: string): Promise<Trip | undefined>;

  // User Review operations
  getUserReview(id: number): Promise<UserReview | undefined>;
  getUserReviewsByReviewedUserId(userId: number): Promise<UserReview[]>;
  getUserReviewsByReviewerId(reviewerId: number): Promise<UserReview[]>;
  getUserReviewsByTripId(tripId: number): Promise<UserReview[]>;
  createUserReview(review: InsertUserReview): Promise<UserReview>;

  // Vehicle Review operations
  getVehicleReview(id: number): Promise<VehicleReview | undefined>;
  getVehicleReviewsByVehicleId(vehicleId: number): Promise<VehicleReview[]>;
  getVehicleReviewsByReviewerId(reviewerId: number): Promise<VehicleReview[]>;
  getVehicleReviewsByTripId(tripId: number): Promise<VehicleReview[]>;
  createVehicleReview(review: InsertVehicleReview): Promise<VehicleReview>;

  // Chat operations
  getChatConversation(id: number): Promise<ChatConversation | undefined>;
  getChatConversationsByUserId(userId: number): Promise<ChatConversation[]>;
  createChatConversation(conversation: InsertChatConversation): Promise<ChatConversation>;

  getChatMessages(conversationId: number): Promise<ChatMessage[]>;
  sendChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  markMessagesAsRead(conversationId: number, userId: number): Promise<void>;

  // Enquiry (MD support) operations
  createEnquiry(enquiry: InsertEnquiry): Promise<Enquiry>;
  getEnquiries(): Promise<Enquiry[]>;
  getEnquiry(id: number): Promise<Enquiry | undefined>;
  updateEnquiryStatus(id: number, status: string): Promise<Enquiry | undefined>;
  getEnquiryMessages(enquiryId: number): Promise<EnquiryMessage[]>;
  addEnquiryMessage(message: InsertEnquiryMessage): Promise<EnquiryMessage>;
}

// PostgreSQL-backed storage implementation (Phase 1: real, persistent accounts/data)
export class DbStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUserRating(userId: number, newRating: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) return undefined;

    const currentTotalRatings = user.totalRatings ?? 0;
    const currentAverage = user.averageRating ?? 0;
    const newTotalRatings = currentTotalRatings + 1;
    const newAverage = (currentAverage * currentTotalRatings + newRating) / newTotalRatings;

    const [updated] = await db
      .update(users)
      .set({ averageRating: newAverage, totalRatings: newTotalRatings })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  // Vehicle methods
  async getVehicle(id: number): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle;
  }

  async getVehiclesByUserId(userId: number): Promise<Vehicle[]> {
    return db.select().from(vehicles).where(eq(vehicles.userId, userId));
  }

  async createVehicle(vehicleData: InsertVehicle): Promise<Vehicle> {
    const [vehicle] = await db.insert(vehicles).values(vehicleData).returning();
    return vehicle;
  }

  async updateVehicle(id: number, vehicleData: Partial<Vehicle>): Promise<Vehicle | undefined> {
    const [updated] = await db.update(vehicles).set(vehicleData).where(eq(vehicles.id, id)).returning();
    return updated;
  }

  async updateVehicleRating(vehicleId: number, newRating: number): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, vehicleId));
    if (!vehicle) return undefined;

    const currentTotalRatings = vehicle.totalRatings ?? 0;
    const currentAverage = vehicle.averageRating ?? 0;
    const newTotalRatings = currentTotalRatings + 1;
    const newAverage = (currentAverage * currentTotalRatings + newRating) / newTotalRatings;

    const [updated] = await db
      .update(vehicles)
      .set({ averageRating: newAverage, totalRatings: newTotalRatings })
      .where(eq(vehicles.id, vehicleId))
      .returning();
    return updated;
  }

  // Shift request methods
  async getShiftRequest(id: number): Promise<ShiftRequest | undefined> {
    const [request] = await db.select().from(shiftRequests).where(eq(shiftRequests.id, id));
    return request;
  }

  async getShiftRequestsByUserId(userId: number): Promise<ShiftRequest[]> {
    return db.select().from(shiftRequests).where(eq(shiftRequests.userId, userId));
  }

  async createShiftRequest(requestData: InsertShiftRequest): Promise<ShiftRequest> {
    const [request] = await db.insert(shiftRequests).values(requestData).returning();
    return request;
  }

  async updateShiftRequestStatus(id: number, status: string): Promise<ShiftRequest | undefined> {
    const [updated] = await db
      .update(shiftRequests)
      .set({ status })
      .where(eq(shiftRequests.id, id))
      .returning();
    return updated;
  }

  // Trip methods
  async getTrip(id: number): Promise<Trip | undefined> {
    const [trip] = await db.select().from(trips).where(eq(trips.id, id));
    return trip;
  }

  async getTripsByUserId(userId: number): Promise<Trip[]> {
    const rows = await db
      .select({ trip: trips })
      .from(trips)
      .innerJoin(shiftRequests, eq(trips.shiftRequestId, shiftRequests.id))
      .where(eq(shiftRequests.userId, userId));
    return rows.map((r) => r.trip);
  }

  async getTripsByDriverId(driverId: number): Promise<Trip[]> {
    return db.select().from(trips).where(eq(trips.driverId, driverId));
  }

  async createTrip(tripData: InsertTrip): Promise<Trip> {
    const [trip] = await db.insert(trips).values(tripData).returning();
    return trip;
  }

  async updateTripStatus(id: number, status: string): Promise<Trip | undefined> {
    const [updated] = await db.update(trips).set({ status }).where(eq(trips.id, id)).returning();
    return updated;
  }

  // User Review operations
  async getUserReview(id: number): Promise<UserReview | undefined> {
    const [review] = await db.select().from(userReviews).where(eq(userReviews.id, id));
    return review;
  }

  async getUserReviewsByReviewedUserId(userId: number): Promise<UserReview[]> {
    return db.select().from(userReviews).where(eq(userReviews.reviewedUserId, userId));
  }

  async getUserReviewsByReviewerId(reviewerId: number): Promise<UserReview[]> {
    return db.select().from(userReviews).where(eq(userReviews.reviewerId, reviewerId));
  }

  async getUserReviewsByTripId(tripId: number): Promise<UserReview[]> {
    return db.select().from(userReviews).where(eq(userReviews.tripId, tripId));
  }

  async createUserReview(reviewData: InsertUserReview): Promise<UserReview> {
    return db.transaction(async (tx) => {
      const [review] = await tx.insert(userReviews).values(reviewData).returning();

      const [user] = await tx.select().from(users).where(eq(users.id, reviewData.reviewedUserId));
      if (user) {
        const currentTotalRatings = user.totalRatings ?? 0;
        const currentAverage = user.averageRating ?? 0;
        const newTotalRatings = currentTotalRatings + 1;
        const newAverage = (currentAverage * currentTotalRatings + reviewData.rating) / newTotalRatings;
        await tx
          .update(users)
          .set({ averageRating: newAverage, totalRatings: newTotalRatings })
          .where(eq(users.id, reviewData.reviewedUserId));
      }

      return review;
    });
  }

  // Vehicle Review operations
  async getVehicleReview(id: number): Promise<VehicleReview | undefined> {
    const [review] = await db.select().from(vehicleReviews).where(eq(vehicleReviews.id, id));
    return review;
  }

  async getVehicleReviewsByVehicleId(vehicleId: number): Promise<VehicleReview[]> {
    return db.select().from(vehicleReviews).where(eq(vehicleReviews.vehicleId, vehicleId));
  }

  async getVehicleReviewsByReviewerId(reviewerId: number): Promise<VehicleReview[]> {
    return db.select().from(vehicleReviews).where(eq(vehicleReviews.reviewerId, reviewerId));
  }

  async getVehicleReviewsByTripId(tripId: number): Promise<VehicleReview[]> {
    return db.select().from(vehicleReviews).where(eq(vehicleReviews.tripId, tripId));
  }

  async createVehicleReview(reviewData: InsertVehicleReview): Promise<VehicleReview> {
    return db.transaction(async (tx) => {
      const [review] = await tx.insert(vehicleReviews).values(reviewData).returning();

      const [vehicle] = await tx.select().from(vehicles).where(eq(vehicles.id, reviewData.vehicleId));
      if (vehicle) {
        const currentTotalRatings = vehicle.totalRatings ?? 0;
        const currentAverage = vehicle.averageRating ?? 0;
        const newTotalRatings = currentTotalRatings + 1;
        const newAverage = (currentAverage * currentTotalRatings + reviewData.rating) / newTotalRatings;
        await tx
          .update(vehicles)
          .set({ averageRating: newAverage, totalRatings: newTotalRatings })
          .where(eq(vehicles.id, reviewData.vehicleId));
      }

      return review;
    });
  }

  // Chat conversation operations
  async getChatConversation(id: number): Promise<ChatConversation | undefined> {
    const [conversation] = await db.select().from(chatConversations).where(eq(chatConversations.id, id));
    return conversation;
  }

  async getChatConversationsByUserId(userId: number): Promise<ChatConversation[]> {
    return db
      .select()
      .from(chatConversations)
      .where(or(eq(chatConversations.ownerId, userId), eq(chatConversations.travelerId, userId)));
  }

  async createChatConversation(conversation: InsertChatConversation): Promise<ChatConversation> {
    const [created] = await db.insert(chatConversations).values(conversation).returning();
    return created;
  }

  // Chat message operations
  async getChatMessages(conversationId: number): Promise<ChatMessage[]> {
    return db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.conversationId, conversationId))
      .orderBy(asc(chatMessages.createdAt));
  }

  async sendChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [chatMessage] = await db.insert(chatMessages).values(message).returning();
    await db
      .update(chatConversations)
      .set({ updatedAt: new Date() })
      .where(eq(chatConversations.id, message.conversationId));
    return chatMessage;
  }

  async markMessagesAsRead(conversationId: number, userId: number): Promise<void> {
    await db
      .update(chatMessages)
      .set({ isRead: true })
      .where(
        and(
          eq(chatMessages.conversationId, conversationId),
          eq(chatMessages.recipientId, userId),
          eq(chatMessages.isRead, false)
        )
      );
  }

  // Enquiry (MD support) operations
  async createEnquiry(enquiryData: InsertEnquiry): Promise<Enquiry> {
    const [enquiry] = await db.insert(enquiries).values(enquiryData).returning();

    // Seed the chat thread: the customer's first message + an auto-reply from the MD desk
    await this.addEnquiryMessage({ enquiryId: enquiry.id, sender: "customer", message: enquiryData.message });
    await this.addEnquiryMessage({
      enquiryId: enquiry.id,
      sender: "md",
      message: `Hi ${enquiryData.name.split(" ")[0] || "there"}! Thanks for reaching out to Shiftzy. I've received your enquiry for ${enquiryData.pickup} → ${enquiryData.drop} and I'll personally check availability and arrangements. I'll reply here shortly.`,
    });

    return enquiry;
  }

  async getEnquiries(): Promise<Enquiry[]> {
    return db.select().from(enquiries).orderBy(desc(enquiries.createdAt));
  }

  async getEnquiry(id: number): Promise<Enquiry | undefined> {
    const [enquiry] = await db.select().from(enquiries).where(eq(enquiries.id, id));
    return enquiry;
  }

  async updateEnquiryStatus(id: number, status: string): Promise<Enquiry | undefined> {
    const [updated] = await db.update(enquiries).set({ status }).where(eq(enquiries.id, id)).returning();
    return updated;
  }

  async getEnquiryMessages(enquiryId: number): Promise<EnquiryMessage[]> {
    return db
      .select()
      .from(enquiryMessages)
      .where(eq(enquiryMessages.enquiryId, enquiryId))
      .orderBy(asc(enquiryMessages.createdAt));
  }

  async addEnquiryMessage(message: InsertEnquiryMessage): Promise<EnquiryMessage> {
    const [enquiryMessage] = await db.insert(enquiryMessages).values(message).returning();
    return enquiryMessage;
  }
}

// Export an instance of the storage
export const storage = new DbStorage();
