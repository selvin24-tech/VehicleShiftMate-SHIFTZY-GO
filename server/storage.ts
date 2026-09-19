import { eq, and, or, asc, desc, sql, gte } from "drizzle-orm";
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
  payments,
  documents,
  notifications,
  User,
  InsertUser,
  Vehicle,
  InsertVehicle,
  ShiftRequest,
  InsertShiftRequest,
  Trip,
  InsertTrip,
  Payment,
  InsertPayment,
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
  InsertEnquiryMessage,
  DocumentRow,
  InsertDocument,
  DocumentMeta,
  Notification,
} from "@shared/schema";

// Composite shapes returned by the Phase 2 business-flow queries.
export type TripWithRelations = Trip & {
  shiftRequest: ShiftRequest;
  customer: Pick<User, "id" | "name" | "email" | "phone"> | null;
  payment: Payment | null;
};
export type ShiftRequestWithRelations = ShiftRequest & {
  customer: Pick<User, "id" | "name" | "email" | "phone"> | null;
  vehicle: Vehicle | null;
  trip: Trip | null;
  payment: Payment | null;
};
export type ApproveTripInput = {
  price: string;
  driverName?: string | null;
  driverPhone?: string | null;
  driverId?: number | null;
  distance?: string | null;
  notes?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
};

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserRating(userId: number, newRating: number): Promise<User | undefined>;
  updateUserProfile(id: number, patch: Partial<Pick<User, "name" | "phone" | "address" | "avatarUrl">>): Promise<User | undefined>;
  updateUserPassword(id: number, hashedPassword: string): Promise<void>;
  setPasswordResetToken(email: string, tokenHash: string, expires: Date): Promise<User | undefined>;
  getUserByValidResetTokenHash(tokenHash: string): Promise<User | undefined>;
  clearPasswordResetToken(id: number): Promise<void>;

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
  // Phase 2 business flow
  getAllShiftRequestsWithRelations(): Promise<ShiftRequestWithRelations[]>;
  getShiftRequestsWithRelationsByUserId(userId: number): Promise<ShiftRequestWithRelations[]>;
  getShiftRequestWithRelations(id: number): Promise<ShiftRequestWithRelations | undefined>;
  getTripByShiftRequestId(shiftRequestId: number): Promise<Trip | undefined>;
  approveShiftRequestAndCreateTrip(
    requestId: number,
    adminId: number,
    input: ApproveTripInput
  ): Promise<{ request: ShiftRequest; trip: Trip }>;
  rejectShiftRequest(
    requestId: number,
    adminId: number,
    reason: string
  ): Promise<ShiftRequest | undefined>;

  // Trip operations
  getTrip(id: number): Promise<Trip | undefined>;
  getTripsByUserId(userId: number): Promise<Trip[]>;
  getTripsByDriverId(driverId: number): Promise<Trip[]>;
  createTrip(trip: InsertTrip): Promise<Trip>;
  updateTripStatus(id: number, status: string): Promise<Trip | undefined>;
  getTripWithRelations(id: number): Promise<TripWithRelations | undefined>;
  getAllTripsWithRelations(): Promise<TripWithRelations[]>;

  // Payment operations (Phase 2 real vehicle-shifting payments)
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentByProviderOrderId(providerOrderId: string): Promise<Payment | undefined>;
  getLatestPaymentForTrip(tripId: number): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, patch: Partial<Payment>): Promise<Payment | undefined>;

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
  createEnquiry(enquiry: InsertEnquiry, accessTokenHash: string): Promise<Enquiry>;
  getEnquiries(): Promise<Enquiry[]>;
  getEnquiry(id: number): Promise<Enquiry | undefined>;
  updateEnquiryStatus(id: number, status: string): Promise<Enquiry | undefined>;
  getEnquiryMessages(enquiryId: number): Promise<EnquiryMessage[]>;
  addEnquiryMessage(message: InsertEnquiryMessage): Promise<EnquiryMessage>;

  // Document (real file) operations
  createDocument(doc: InsertDocument): Promise<DocumentMeta>;
  getDocumentsByUserId(userId: number): Promise<DocumentMeta[]>;
  getDocumentMeta(id: number): Promise<DocumentMeta | undefined>;
  getDocumentWithData(id: number): Promise<DocumentRow | undefined>;
  deleteDocument(id: number): Promise<void>;
  linkDocumentToShiftRequest(docId: number, shiftRequestId: number, vehicleId: number): Promise<void>;

  // Real payment history
  getPaymentsByUserId(userId: number): Promise<Payment[]>;

  // Notifications
  createNotification(n: { userId: number; type: string; title: string; body: string; relatedId?: number | null }): Promise<Notification>;
  getNotificationsByUserId(userId: number): Promise<Notification[]>;
  getUnreadNotificationCount(userId: number): Promise<number>;
  markNotificationRead(id: number, userId: number): Promise<void>;
  markAllNotificationsRead(userId: number): Promise<void>;

  // Admin — real aggregate summary (Control Center overview)
  getAdminSummary(): Promise<{
    pendingRequests: number;
    activeTrips: number;
    completedTrips: number;
    totalUsers: number;
    totalCustomers: number;
    paymentsPaidToday: number;
    revenueToday: number;
    revenueAllTime: number;
    openEnquiries: number;
  }>;
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

  async updateUserProfile(
    id: number,
    patch: Partial<Pick<User, "name" | "phone" | "address" | "avatarUrl">>
  ): Promise<User | undefined> {
    const [updated] = await db.update(users).set(patch).where(eq(users.id, id)).returning();
    return updated;
  }

  async updateUserPassword(id: number, hashedPassword: string): Promise<void> {
    await db
      .update(users)
      .set({ password: hashedPassword, resetTokenHash: null, resetTokenExpires: null })
      .where(eq(users.id, id));
  }

  async setPasswordResetToken(email: string, tokenHash: string, expires: Date): Promise<User | undefined> {
    const user = await this.getUserByEmail(email);
    if (!user) return undefined;
    const [updated] = await db
      .update(users)
      .set({ resetTokenHash: tokenHash, resetTokenExpires: expires })
      .where(eq(users.id, user.id))
      .returning();
    return updated;
  }

  async getUserByValidResetTokenHash(tokenHash: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.resetTokenHash, tokenHash));
    if (!user || !user.resetTokenExpires) return undefined;
    if (user.resetTokenExpires.getTime() < Date.now()) return undefined;
    return user;
  }

  async clearPasswordResetToken(id: number): Promise<void> {
    await db.update(users).set({ resetTokenHash: null, resetTokenExpires: null }).where(eq(users.id, id));
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

  // --- Phase 2 business flow: ShiftRequest -> Trip -> Payment ---
  private customerCols = {
    id: users.id,
    name: users.name,
    email: users.email,
    phone: users.phone,
  };

  async getTripByShiftRequestId(shiftRequestId: number): Promise<Trip | undefined> {
    const [trip] = await db
      .select()
      .from(trips)
      .where(eq(trips.shiftRequestId, shiftRequestId))
      .orderBy(desc(trips.id))
      .limit(1);
    return trip;
  }

  async getLatestPaymentForTrip(tripId: number): Promise<Payment | undefined> {
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.tripId, tripId))
      .orderBy(desc(payments.id))
      .limit(1);
    return payment;
  }

  private async hydrateShiftRequest(request: ShiftRequest): Promise<ShiftRequestWithRelations> {
    const [customer] = request.userId
      ? await db.select(this.customerCols).from(users).where(eq(users.id, request.userId))
      : [];
    const [vehicle] = request.vehicleId
      ? await db.select().from(vehicles).where(eq(vehicles.id, request.vehicleId))
      : [];
    const trip = await this.getTripByShiftRequestId(request.id);
    const payment = trip ? await this.getLatestPaymentForTrip(trip.id) : undefined;
    return {
      ...request,
      customer: customer ?? null,
      vehicle: vehicle ?? null,
      trip: trip ?? null,
      payment: payment ?? null,
    };
  }

  async getAllShiftRequestsWithRelations(): Promise<ShiftRequestWithRelations[]> {
    const rows = await db.select().from(shiftRequests).orderBy(desc(shiftRequests.id));
    return Promise.all(rows.map((r) => this.hydrateShiftRequest(r)));
  }

  async getShiftRequestsWithRelationsByUserId(userId: number): Promise<ShiftRequestWithRelations[]> {
    const rows = await db
      .select()
      .from(shiftRequests)
      .where(eq(shiftRequests.userId, userId))
      .orderBy(desc(shiftRequests.id));
    return Promise.all(rows.map((r) => this.hydrateShiftRequest(r)));
  }

  async getShiftRequestWithRelations(id: number): Promise<ShiftRequestWithRelations | undefined> {
    const [row] = await db.select().from(shiftRequests).where(eq(shiftRequests.id, id));
    if (!row) return undefined;
    return this.hydrateShiftRequest(row);
  }

  async approveShiftRequestAndCreateTrip(
    requestId: number,
    adminId: number,
    input: ApproveTripInput
  ): Promise<{ request: ShiftRequest; trip: Trip }> {
    return db.transaction(async (tx) => {
      const [request] = await tx
        .select()
        .from(shiftRequests)
        .where(eq(shiftRequests.id, requestId));
      if (!request) throw new Error("Shift request not found");

      const [existingTrip] = await tx
        .select()
        .from(trips)
        .where(eq(trips.shiftRequestId, requestId))
        .limit(1);
      if (existingTrip) throw new Error("A trip already exists for this shift request");

      const [trip] = await tx
        .insert(trips)
        .values({
          shiftRequestId: requestId,
          driverId: input.driverId ?? null,
          driverName: input.driverName ?? null,
          driverPhone: input.driverPhone ?? null,
          price: input.price,
          distance: input.distance ?? null,
          notes: input.notes ?? null,
          startDate: input.startDate ?? null,
          endDate: input.endDate ?? null,
          status: "awaiting_payment",
        })
        .returning();

      const [updatedRequest] = await tx
        .update(shiftRequests)
        .set({ status: "approved", reviewedBy: adminId, reviewedAt: new Date(), rejectionReason: null })
        .where(eq(shiftRequests.id, requestId))
        .returning();

      return { request: updatedRequest, trip };
    });
  }

  async rejectShiftRequest(
    requestId: number,
    adminId: number,
    reason: string
  ): Promise<ShiftRequest | undefined> {
    const [updated] = await db
      .update(shiftRequests)
      .set({ status: "rejected", reviewedBy: adminId, reviewedAt: new Date(), rejectionReason: reason })
      .where(eq(shiftRequests.id, requestId))
      .returning();
    return updated;
  }

  private async hydrateTrip(trip: Trip): Promise<TripWithRelations> {
    const [shiftRequest] = await db
      .select()
      .from(shiftRequests)
      .where(eq(shiftRequests.id, trip.shiftRequestId));
    const [customer] = shiftRequest?.userId
      ? await db.select(this.customerCols).from(users).where(eq(users.id, shiftRequest.userId))
      : [];
    const payment = await this.getLatestPaymentForTrip(trip.id);
    return {
      ...trip,
      shiftRequest: shiftRequest!,
      customer: customer ?? null,
      payment: payment ?? null,
    };
  }

  async getTripWithRelations(id: number): Promise<TripWithRelations | undefined> {
    const [trip] = await db.select().from(trips).where(eq(trips.id, id));
    if (!trip) return undefined;
    return this.hydrateTrip(trip);
  }

  async getAllTripsWithRelations(): Promise<TripWithRelations[]> {
    const rows = await db.select().from(trips).orderBy(desc(trips.id));
    return Promise.all(rows.map((t) => this.hydrateTrip(t)));
  }

  // --- Payment methods ---
  async getPayment(id: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment;
  }

  async getPaymentByProviderOrderId(providerOrderId: string): Promise<Payment | undefined> {
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.providerOrderId, providerOrderId));
    return payment;
  }

  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const [payment] = await db.insert(payments).values(paymentData).returning();
    return payment;
  }

  async updatePayment(id: number, patch: Partial<Payment>): Promise<Payment | undefined> {
    const [updated] = await db
      .update(payments)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(payments.id, id))
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
  async createEnquiry(enquiryData: InsertEnquiry, accessTokenHash: string): Promise<Enquiry> {
    const [enquiry] = await db.insert(enquiries).values({ ...enquiryData, accessTokenHash }).returning();

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

  // --- Document (real file) operations ---
  private stripData(doc: DocumentRow): DocumentMeta {
    const { data, ...meta } = doc;
    return meta;
  }

  async createDocument(docData: InsertDocument): Promise<DocumentMeta> {
    const [doc] = await db.insert(documents).values(docData).returning();
    return this.stripData(doc);
  }

  async getDocumentsByUserId(userId: number): Promise<DocumentMeta[]> {
    const rows = await db
      .select({
        id: documents.id,
        userId: documents.userId,
        vehicleId: documents.vehicleId,
        shiftRequestId: documents.shiftRequestId,
        type: documents.type,
        fileName: documents.fileName,
        mimeType: documents.mimeType,
        fileSize: documents.fileSize,
        status: documents.status,
        createdAt: documents.createdAt,
      })
      .from(documents)
      .where(eq(documents.userId, userId))
      .orderBy(desc(documents.id));
    return rows as DocumentMeta[];
  }

  async getDocumentMeta(id: number): Promise<DocumentMeta | undefined> {
    const [doc] = await db.select().from(documents).where(eq(documents.id, id));
    return doc ? this.stripData(doc) : undefined;
  }

  async getDocumentWithData(id: number): Promise<DocumentRow | undefined> {
    const [doc] = await db.select().from(documents).where(eq(documents.id, id));
    return doc;
  }

  async deleteDocument(id: number): Promise<void> {
    await db.delete(documents).where(eq(documents.id, id));
  }

  async linkDocumentToShiftRequest(docId: number, shiftRequestId: number, vehicleId: number): Promise<void> {
    await db.update(documents).set({ shiftRequestId, vehicleId }).where(eq(documents.id, docId));
  }

  // --- Real payment history ---
  async getPaymentsByUserId(userId: number): Promise<Payment[]> {
    return db.select().from(payments).where(eq(payments.userId, userId)).orderBy(desc(payments.id));
  }

  // --- Notifications ---
  async createNotification(n: {
    userId: number;
    type: string;
    title: string;
    body: string;
    relatedId?: number | null;
  }): Promise<Notification> {
    const [created] = await db
      .insert(notifications)
      .values({ ...n, relatedId: n.relatedId ?? null })
      .returning();
    return created;
  }

  async getNotificationsByUserId(userId: number): Promise<Notification[]> {
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.id))
      .limit(50);
  }

  async getUnreadNotificationCount(userId: number): Promise<number> {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return count;
  }

  async markNotificationRead(id: number, userId: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
  }

  async markAllNotificationsRead(userId: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  }

  // --- Admin — real aggregate summary ---
  async getAdminSummary() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [[pending], [active], [completed], [totalUsers], [totalCustomers], [paidToday], [openEnq], allPaid] =
      await Promise.all([
        db.select({ c: sql<number>`count(*)::int` }).from(shiftRequests).where(eq(shiftRequests.status, "pending")),
        db
          .select({ c: sql<number>`count(*)::int` })
          .from(trips)
          .where(sql`${trips.status} in ('scheduled','in_transit')`),
        db.select({ c: sql<number>`count(*)::int` }).from(trips).where(eq(trips.status, "completed")),
        db.select({ c: sql<number>`count(*)::int` }).from(users),
        db.select({ c: sql<number>`count(*)::int` }).from(users).where(eq(users.role, "customer")),
        db
          .select({ c: sql<number>`count(*)::int`, sum: sql<number>`coalesce(sum(${payments.amount}::numeric),0)::float` })
          .from(payments)
          .where(and(eq(payments.status, "paid"), gte(payments.paidAt, startOfToday))),
        db.select({ c: sql<number>`count(*)::int` }).from(enquiries).where(sql`${enquiries.status} != 'resolved'`),
        db
          .select({ sum: sql<number>`coalesce(sum(${payments.amount}::numeric),0)::float` })
          .from(payments)
          .where(eq(payments.status, "paid")),
      ]);

    return {
      pendingRequests: pending.c,
      activeTrips: active.c,
      completedTrips: completed.c,
      totalUsers: totalUsers.c,
      totalCustomers: totalCustomers.c,
      paymentsPaidToday: paidToday.c,
      revenueToday: paidToday.sum,
      revenueAllTime: allPaid[0].sum,
      openEnquiries: openEnq.c,
    };
  }
}

// Export an instance of the storage
export const storage = new DbStorage();
