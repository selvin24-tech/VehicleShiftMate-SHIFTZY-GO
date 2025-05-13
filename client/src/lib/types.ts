export interface VehicleType {
  id: string;
  name: string;
  icon: string;
}

export interface Location {
  id: string;
  name: string;
  address: string;
}

export interface Trip {
  id: string;
  vehicle: Vehicle;
  pickupLocation: Location;
  dropLocation: Location;
  date: string;
  price: number;
  status: 'completed' | 'in-transit' | 'cancelled' | 'pending';
  distance?: number;
}

export interface Vehicle {
  id: string;
  type: 'car' | 'bike';
  make: string;
  model: string;
  registrationNumber: string;
  color?: string;
  fuelType?: string;
  seatingCapacity?: number;
  image?: string;
  ownerId?: string;
  ownerName?: string;
  rating?: number;
  availabilityStatus?: 'available' | 'unavailable' | 'available-tomorrow';
  features?: string[];
  pricePerDay?: number;
}

export interface Testimonial {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatarUrl?: string;
  isVerified: boolean;
  address?: string;
  vehicles?: Vehicle[];
  trips?: Trip[];
}

export interface ShiftRequestFormData {
  vehicleType: 'car' | 'bike';
  vehicleModel: string;
  registrationNumber: string;
  pickupLocation: string;
  dropLocation: string;
  insuranceExpiryDate: string;
  vehiclePhoto?: File;
}

export interface TravelSearchFilters {
  vehicleType?: 'car' | 'bike' | 'luxury';
  pickupLocation?: string;
  destination?: string;
  searchQuery?: string;
}
