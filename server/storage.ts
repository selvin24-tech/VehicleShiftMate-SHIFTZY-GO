import { 
  User, 
  InsertUser, 
  Vehicle, 
  InsertVehicle, 
  ShiftRequest, 
  InsertShiftRequest, 
  Trip, 
  InsertTrip, 
  Testimonial, 
  InsertTestimonial,
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
  
  // Vehicle operations
  getVehicle(id: number): Promise<Vehicle | undefined>;
  getVehiclesByUserId(userId: number): Promise<Vehicle[]>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: number, vehicle: Partial<Vehicle>): Promise<Vehicle | undefined>;
  
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
  
  // Testimonial operations
  getTestimonial(id: number): Promise<Testimonial | undefined>;
  getTestimonialsByUserId(userId: number): Promise<Testimonial[]>;
  getTestimonialsByTripId(tripId: number): Promise<Testimonial[]>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  
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
  private testimonials: Map<number, Testimonial>;
  private chatConversations: Map<number, ChatConversation>;
  private chatMessages: Map<number, ChatMessage>;
  
  private userIdCounter: number = 1;
  private vehicleIdCounter: number = 1;
  private shiftRequestIdCounter: number = 1;
  private tripIdCounter: number = 1;
  private testimonialIdCounter: number = 1;
  
  constructor() {
    this.users = new Map();
    this.vehicles = new Map();
    this.shiftRequests = new Map();
    this.trips = new Map();
    this.testimonials = new Map();
    
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
    
    // Sample testimonials
    this.createTestimonial({
      userId: user1.id,
      tripId: 1,
      rating: "5",
      comment: "Excellent service! My car was transported safely and on time."
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
  
  // Testimonial methods
  async getTestimonial(id: number): Promise<Testimonial | undefined> {
    return this.testimonials.get(id);
  }
  
  async getTestimonialsByUserId(userId: number): Promise<Testimonial[]> {
    return Array.from(this.testimonials.values()).filter(testimonial => testimonial.userId === userId);
  }
  
  async getTestimonialsByTripId(tripId: number): Promise<Testimonial[]> {
    return Array.from(this.testimonials.values()).filter(testimonial => testimonial.tripId === tripId);
  }
  
  async createTestimonial(testimonialData: InsertTestimonial): Promise<Testimonial> {
    const id = this.testimonialIdCounter++;
    const now = new Date();
    const testimonial: Testimonial = { ...testimonialData, id, createdAt: now };
    this.testimonials.set(id, testimonial);
    return testimonial;
  }
}

// Export an instance of the storage
export const storage = new MemStorage();
