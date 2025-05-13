import { Testimonial, Vehicle, Trip } from "./types";

export const VEHICLE_TYPES = [
  {
    id: "car",
    name: "Car",
    icon: "car",
  },
  {
    id: "bike",
    name: "Bike",
    icon: "motorcycle",
  }
];

export const RECENT_TRIPS: Trip[] = [
  {
    id: "trip1",
    vehicle: {
      id: "v1",
      type: "car",
      make: "Honda",
      model: "City",
      registrationNumber: "TN 01 AB 1234",
    },
    pickupLocation: {
      id: "loc1",
      name: "Chennai",
      address: "Chennai, Tamil Nadu"
    },
    dropLocation: {
      id: "loc2",
      name: "Tiruvannamalai",
      address: "Tiruvannamalai, Tamil Nadu"
    },
    date: "2023-05-15",
    price: 2500,
    status: "completed"
  },
  {
    id: "trip2",
    vehicle: {
      id: "v2",
      type: "bike",
      make: "Royal Enfield",
      model: "Classic",
      registrationNumber: "TN 07 CK 5678",
    },
    pickupLocation: {
      id: "loc1",
      name: "Chennai",
      address: "Chennai, Tamil Nadu"
    },
    dropLocation: {
      id: "loc3",
      name: "Coimbatore",
      address: "Coimbatore, Tamil Nadu"
    },
    date: "2023-04-28",
    price: 1800,
    status: "in-transit"
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    userName: "Rajesh Kumar",
    userAvatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d",
    rating: 5,
    comment: "Excellent service! My car was transported from Chennai to Bangalore safely and on time. Would recommend to everyone."
  },
  {
    id: "t2",
    userName: "Priya Sharma",
    userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    rating: 4.5,
    comment: "I needed to transport my bike to my hometown urgently, and VehicleShift made it so easy. The driver was professional and kept me updated."
  },
  {
    id: "t3",
    userName: "Mohan Reddy",
    userAvatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a",
    rating: 4,
    comment: "Got to drive a luxury car for my weekend trip. The experience was amazing and the process was hassle-free."
  }
];

export const AVAILABLE_VEHICLES: Vehicle[] = [
  {
    id: "av1",
    type: "car",
    make: "Toyota",
    model: "Innova",
    registrationNumber: "TN 05 XY 7890",
    fuelType: "Diesel",
    seatingCapacity: 7,
    image: "https://images.unsplash.com/photo-1550355291-bbee04a92027",
    ownerId: "u1",
    ownerName: "Ramu S.",
    rating: 4.7,
    availabilityStatus: "available",
    features: ["AC", "Available Now"],
    pricePerDay: 3500
  },
  {
    id: "av2",
    type: "bike",
    make: "Royal Enfield",
    model: "Himalayan",
    registrationNumber: "TN 10 AB 4321",
    fuelType: "Petrol",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf",
    ownerId: "u2",
    ownerName: "Janu K.",
    rating: 4.5,
    availabilityStatus: "available-tomorrow",
    features: ["Adventure", "Available Tomorrow"],
    pricePerDay: 1200
  },
  {
    id: "av3",
    type: "car",
    make: "Hyundai",
    model: "Creta",
    registrationNumber: "TN 02 CD 5678",
    fuelType: "Petrol",
    seatingCapacity: 5,
    image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738",
    ownerId: "u3",
    ownerName: "Priya M.",
    rating: 4.9,
    availabilityStatus: "available",
    features: ["Premium", "Available Now"],
    pricePerDay: 2800
  }
];

export const USER_VEHICLES = [
  {
    id: "uv1",
    type: "car",
    make: "Honda",
    model: "City",
    registrationNumber: "TN 01 AB 1234",
  },
  {
    id: "uv2",
    type: "bike",
    make: "Royal Enfield",
    model: "Classic",
    registrationNumber: "TN 07 CK 5678",
  }
];

export const USER_PROFILE = {
  id: "user1",
  name: "Vivek Singh",
  phone: "+91 98765 43210",
  email: "vivek.s@example.com",
  avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61",
  isVerified: true,
  address: "Chennai",
  vehicles: USER_VEHICLES,
  trips: RECENT_TRIPS
};

export const LOCATIONS = [
  "Chennai",
  "Tiruvannamalai",
  "Bangalore",
  "Coimbatore",
  "Madurai",
  "Salem",
  "Tirupati",
  "Pondicherry",
  "Kochi"
];
