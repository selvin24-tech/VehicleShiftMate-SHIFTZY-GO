import { 
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
  InsertChatMessage
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
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private vehicles: Map<number, Vehicle>;
  private shiftRequests: Map<number, ShiftRequest>;
  private trips: Map<number, Trip>;
  private userReviews: Map<number, UserReview>;
  private vehicleReviews: Map<number, VehicleReview>;
  private chatConversations: Map<number, ChatConversation>;
  private chatMessages: Map<number, ChatMessage>;
  
  private userIdCounter: number = 1;
  private vehicleIdCounter: number = 1;
  private shiftRequestIdCounter: number = 1;
  private tripIdCounter: number = 1;
  private userReviewIdCounter: number = 1;
  private vehicleReviewIdCounter: number = 1;
  private chatConversationIdCounter: number = 1;
  private chatMessageIdCounter: number = 1;
  
  constructor() {
    this.users = new Map();
    this.vehicles = new Map();
    this.shiftRequests = new Map();
    this.trips = new Map();
    this.userReviews = new Map();
    this.vehicleReviews = new Map();
    this.chatConversations = new Map();
    this.chatMessages = new Map();
    
    // Initialize with some sample data
    this.initSampleData();
  }
  
  private initSampleData() {
    // Sample users
    const user1 = this.createUser({
      name: "Vivek Singh",
      email: "vivek@example.com",
      password: "password123",
      phone: "+91 98765 43210",
      avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61",
      isVerified: true,
      address: "Chennai"
    });
    
    const user2 = this.createUser({
      name: "Ananya Sharma",
      email: "ananya@example.com",
      password: "password456",
      phone: "+91 91234 56789",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
      isVerified: true,
      address: "Bangalore"
    });
    
    // Sample vehicles
    const vehicle1 = this.createVehicle({
      userId: user1.id,
      type: "car",
      make: "Honda",
      model: "City",
      registrationNumber: "TN 01 AB 1234",
      color: "Silver",
      fuelType: "Petrol",
      seatingCapacity: "5",
      forRent: false
    });
    
    const vehicle2 = this.createVehicle({
      userId: user1.id,
      type: "bike",
      make: "Royal Enfield",
      model: "Classic",
      registrationNumber: "TN 07 CK 5678",
      color: "Black",
      fuelType: "Petrol",
      forRent: false
    });
    
    // Sample shift requests
    const shiftRequest1 = this.createShiftRequest({
      userId: user1.id,
      vehicleId: vehicle1.id,
      pickupLocation: "Chennai",
      dropLocation: "Tiruvannamalai",
      insuranceExpiryDate: "2024-05-15",
      status: "completed"
    });
    
    const shiftRequest2 = this.createShiftRequest({
      userId: user1.id,
      vehicleId: vehicle2.id,
      pickupLocation: "Chennai",
      dropLocation: "Coimbatore",
      insuranceExpiryDate: "2024-04-28",
      status: "in-transit"
    });
    
    // Sample trips
    this.createTrip({
      shiftRequestId: shiftRequest1.id,
      driverId: user1.id,
      startDate: new Date("2023-05-15"),
      endDate: new Date("2023-05-15"),
      price: "2500",
      distance: "300",
      status: "completed"
    });
    
    this.createTrip({
      shiftRequestId: shiftRequest2.id,
      driverId: user1.id,
      startDate: new Date("2023-04-28"),
      price: "1800",
      distance: "500",
      status: "in-transit"
    });
    
    // Sample user review
    this.createUserReview({
      reviewedUserId: user2.id,
      reviewerId: user1.id,
      tripId: 1,
      rating: 5,
      userType: "driver",
      comment: "Excellent driver! On time and very professional."
    });
    
    // Sample vehicle review
    this.createVehicleReview({
      vehicleId: 1,
      reviewerId: user2.id,
      tripId: 1,
      rating: 5,
      comfort: 4,
      cleanliness: 5,
      performance: 5,
      comment: "Car was in great condition, very comfortable for the journey."
    });
    
    // Sample chat conversation
    const conversation = this.createChatConversation({
      ownerId: user1.id,
      travelerId: user2.id,
      shiftRequestId: shiftRequest1.id,
      status: "active"
    });
    
    // Sample chat messages
    this.sendChatMessage({
      conversationId: conversation.id,
      senderId: user1.id,
      recipientId: user2.id,
      message: "Hello! I'm interested in shifting my vehicle to Tiruvannamalai."
    });
    
    this.sendChatMessage({
      conversationId: conversation.id,
      senderId: user2.id,
      recipientId: user1.id,
      message: "Hi there! Thanks for reaching out. I can help with that."
    });
    
    this.sendChatMessage({
      conversationId: conversation.id,
      senderId: user1.id,
      recipientId: user2.id,
      message: "Great! When would you be available for pickup?"
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }
  
  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { ...userData, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }
  
  // Vehicle methods
  async getVehicle(id: number): Promise<Vehicle | undefined> {
    return this.vehicles.get(id);
  }
  
  async getVehiclesByUserId(userId: number): Promise<Vehicle[]> {
    return Array.from(this.vehicles.values()).filter(vehicle => vehicle.userId === userId);
  }
  
  async createVehicle(vehicleData: InsertVehicle): Promise<Vehicle> {
    const id = this.vehicleIdCounter++;
    const now = new Date();
    const vehicle: Vehicle = { ...vehicleData, id, createdAt: now };
    this.vehicles.set(id, vehicle);
    return vehicle;
  }
  
  async updateVehicle(id: number, vehicleData: Partial<Vehicle>): Promise<Vehicle | undefined> {
    const vehicle = this.vehicles.get(id);
    if (!vehicle) return undefined;
    
    const updatedVehicle = { ...vehicle, ...vehicleData };
    this.vehicles.set(id, updatedVehicle);
    return updatedVehicle;
  }
  
  // Shift request methods
  async getShiftRequest(id: number): Promise<ShiftRequest | undefined> {
    return this.shiftRequests.get(id);
  }
  
  async getShiftRequestsByUserId(userId: number): Promise<ShiftRequest[]> {
    return Array.from(this.shiftRequests.values()).filter(request => request.userId === userId);
  }
  
  async createShiftRequest(requestData: InsertShiftRequest): Promise<ShiftRequest> {
    const id = this.shiftRequestIdCounter++;
    const now = new Date();
    const shiftRequest: ShiftRequest = { 
      ...requestData, 
      id, 
      requestDate: now,
      createdAt: now 
    };
    this.shiftRequests.set(id, shiftRequest);
    return shiftRequest;
  }
  
  async updateShiftRequestStatus(id: number, status: string): Promise<ShiftRequest | undefined> {
    const request = this.shiftRequests.get(id);
    if (!request) return undefined;
    
    const updatedRequest = { ...request, status };
    this.shiftRequests.set(id, updatedRequest);
    return updatedRequest;
  }
  
  // Trip methods
  async getTrip(id: number): Promise<Trip | undefined> {
    return this.trips.get(id);
  }
  
  async getTripsByUserId(userId: number): Promise<Trip[]> {
    // Get all shift requests for this user
    const userShiftRequests = await this.getShiftRequestsByUserId(userId);
    const shiftRequestIds = userShiftRequests.map(request => request.id);
    
    // Return all trips for these shift requests
    return Array.from(this.trips.values()).filter(trip => 
      shiftRequestIds.includes(trip.shiftRequestId)
    );
  }
  
  async getTripsByDriverId(driverId: number): Promise<Trip[]> {
    return Array.from(this.trips.values()).filter(trip => trip.driverId === driverId);
  }
  
  async createTrip(tripData: InsertTrip): Promise<Trip> {
    const id = this.tripIdCounter++;
    const now = new Date();
    const trip: Trip = { ...tripData, id, createdAt: now };
    this.trips.set(id, trip);
    return trip;
  }
  
  async updateTripStatus(id: number, status: string): Promise<Trip | undefined> {
    const trip = this.trips.get(id);
    if (!trip) return undefined;
    
    const updatedTrip = { ...trip, status };
    this.trips.set(id, updatedTrip);
    return updatedTrip;
  }
  
  // User Review operations
  async getUserReview(id: number): Promise<UserReview | undefined> {
    return this.userReviews.get(id);
  }

  async getUserReviewsByReviewedUserId(userId: number): Promise<UserReview[]> {
    return Array.from(this.userReviews.values()).filter(review => review.reviewedUserId === userId);
  }

  async getUserReviewsByReviewerId(reviewerId: number): Promise<UserReview[]> {
    return Array.from(this.userReviews.values()).filter(review => review.reviewerId === reviewerId);
  }

  async getUserReviewsByTripId(tripId: number): Promise<UserReview[]> {
    return Array.from(this.userReviews.values()).filter(review => review.tripId === tripId);
  }

  async createUserReview(reviewData: InsertUserReview): Promise<UserReview> {
    const id = this.userReviewIdCounter++;
    const now = new Date();
    
    const review: UserReview = { ...reviewData, id, createdAt: now };
    this.userReviews.set(id, review);
    
    // Update the user's average rating
    await this.updateUserRating(reviewData.reviewedUserId, reviewData.rating);
    
    return review;
  }

  // Vehicle Review operations
  async getVehicleReview(id: number): Promise<VehicleReview | undefined> {
    return this.vehicleReviews.get(id);
  }

  async getVehicleReviewsByVehicleId(vehicleId: number): Promise<VehicleReview[]> {
    return Array.from(this.vehicleReviews.values()).filter(review => review.vehicleId === vehicleId);
  }

  async getVehicleReviewsByReviewerId(reviewerId: number): Promise<VehicleReview[]> {
    return Array.from(this.vehicleReviews.values()).filter(review => review.reviewerId === reviewerId);
  }

  async getVehicleReviewsByTripId(tripId: number): Promise<VehicleReview[]> {
    return Array.from(this.vehicleReviews.values()).filter(review => review.tripId === tripId);
  }

  async createVehicleReview(reviewData: InsertVehicleReview): Promise<VehicleReview> {
    const id = this.vehicleReviewIdCounter++;
    const now = new Date();
    
    const review: VehicleReview = { ...reviewData, id, createdAt: now };
    this.vehicleReviews.set(id, review);
    
    // Update the vehicle's average rating
    await this.updateVehicleRating(reviewData.vehicleId, reviewData.rating);
    
    return review;
  }

  // User Rating Update
  async updateUserRating(userId: number, newRating: number): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    // Calculate new average rating
    const currentTotalRatings = user.totalRatings || 0;
    const currentAverage = user.averageRating || 0;
    
    const newTotalRatings = currentTotalRatings + 1;
    const newAverage = ((currentAverage * currentTotalRatings) + newRating) / newTotalRatings;
    
    // Update user's rating
    const updatedUser = {
      ...user,
      averageRating: newAverage,
      totalRatings: newTotalRatings
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  // Vehicle Rating Update
  async updateVehicleRating(vehicleId: number, newRating: number): Promise<Vehicle | undefined> {
    const vehicle = this.vehicles.get(vehicleId);
    if (!vehicle) return undefined;
    
    // Calculate new average rating
    const currentTotalRatings = vehicle.totalRatings || 0;
    const currentAverage = vehicle.averageRating || 0;
    
    const newTotalRatings = currentTotalRatings + 1;
    const newAverage = ((currentAverage * currentTotalRatings) + newRating) / newTotalRatings;
    
    // Update vehicle's rating
    const updatedVehicle = {
      ...vehicle,
      averageRating: newAverage,
      totalRatings: newTotalRatings
    };
    
    this.vehicles.set(vehicleId, updatedVehicle);
    return updatedVehicle;
  }

  // Chat conversation operations
  async getChatConversation(id: number): Promise<ChatConversation | undefined> {
    return this.chatConversations.get(id);
  }

  async getChatConversationsByUserId(userId: number): Promise<ChatConversation[]> {
    return Array.from(this.chatConversations.values()).filter(
      conversation => conversation.ownerId === userId || conversation.travelerId === userId
    );
  }

  async createChatConversation(conversation: InsertChatConversation): Promise<ChatConversation> {
    const id = this.chatConversationIdCounter++;
    const now = new Date();
    
    const chatConversation: ChatConversation = { 
      ...conversation, 
      id, 
      createdAt: now,
      updatedAt: now
    };
    
    this.chatConversations.set(id, chatConversation);
    return chatConversation;
  }

  // Chat message operations
  async getChatMessages(conversationId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(message => message.conversationId === conversationId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async sendChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const id = this.chatMessageIdCounter++;
    const now = new Date();
    
    const chatMessage: ChatMessage = { 
      ...message, 
      id, 
      createdAt: now 
    };
    
    this.chatMessages.set(id, chatMessage);
    
    // Update the conversation's updatedAt timestamp
    const conversation = await this.getChatConversation(message.conversationId);
    if (conversation) {
      conversation.updatedAt = now;
      this.chatConversations.set(conversation.id, conversation);
    }
    
    return chatMessage;
  }

  async markMessagesAsRead(conversationId: number, userId: number): Promise<void> {
    const messages = await this.getChatMessages(conversationId);
    
    messages.forEach(message => {
      if (message.recipientId === userId && !message.isRead) {
        message.isRead = true;
        this.chatMessages.set(message.id, message);
      }
    });
  }
}

// Export an instance of the storage
export const storage = new MemStorage();
