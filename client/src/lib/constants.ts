import { Testimonial, Vehicle, Trip, ShiftRequest, Review } from "./types";

// ─── Shared-Cost Marketplace Model ───────────────────────────────────────────
// Core insight: One needs the vehicle moved. The other needs transportation.
// Both share the SAME trip cost → both pay LESS than going alone.
//
// Trip cost = Fuel + Tolls + Platform fee
// Owner contributes ~50%  → saves massively vs ₹20,000+ transport company
// Traveler contributes ~50% → saves vs their own travel (bus/train/taxi)
//
// Formula: ownerShare + travelerShare = totalTripCost
// App calculates this dynamically based on: distance · vehicle type · fuel price · demand
// ──────────────────────────────────────────────────────────────────────────────
export const PRICING_STRUCTURE = {
  normal: {
    label: "Normal",
    color: "green",
    examples: ["Swift", "i20", "Amaze", "City", "Innova", "Creta"],
    totalCostPerKm: 12,           // fuel ₹8.5 + toll ₹1.5 + platform ₹2
    ownerSharePerKm: 6,           // 50% of trip cost
    travelerSharePerKm: 6,        // 50% of trip cost
    transportCompanyPerKm: 32,    // what a traditional transport company charges
    travelerAltPerKm: 8,          // traveler's alternative (bus/train/own fuel)
    ownerSaving: "~80% vs transport company",
    travelerSaving: "~25% vs own travel",
    description: "Everyday vehicles. Both sides split cost 50-50.",
  },
  premium: {
    label: "Premium",
    color: "purple",
    examples: ["BMW", "Mercedes", "Audi", "Jaguar", "Lexus"],
    totalCostPerKm: 16,
    ownerSharePerKm: 8,
    travelerSharePerKm: 8,
    transportCompanyPerKm: 50,
    travelerAltPerKm: 10,
    ownerSaving: "~84% vs transport company",
    travelerSaving: "~20% vs own travel",
    description: "Luxury vehicles. Experience premium travel at shared cost.",
  },
  bike: {
    label: "Bike",
    color: "blue",
    examples: ["Pulsar", "Apache", "Hero Xpulse"],
    totalCostPerKm: 8,
    ownerSharePerKm: 4,
    travelerSharePerKm: 4,
    transportCompanyPerKm: 15,
    travelerAltPerKm: 6,
    description: "Two-wheelers for quick local and city shifts.",
  },
  premiumBike: {
    label: "Premium Bike",
    color: "indigo",
    examples: ["KTM Duke", "Royal Enfield Himalayan"],
    totalCostPerKm: 10,
    ownerSharePerKm: 5,
    travelerSharePerKm: 5,
    transportCompanyPerKm: 22,
    travelerAltPerKm: 8,
    description: "Performance bikes. Great for weekend road trips.",
  },
  suv: {
    label: "SUV",
    color: "orange",
    examples: ["XUV700", "Harrier", "Hector", "Scorpio"],
    totalCostPerKm: 14,
    ownerSharePerKm: 7,
    travelerSharePerKm: 7,
    transportCompanyPerKm: 40,
    travelerAltPerKm: 10,
    description: "Spacious family SUVs. Perfect for long family road trips.",
  },
};

// ─── Central Fare Config (petrol-price driven) ───────────────────────────────
// All fares are computed from the CURRENT petrol price so rates stay fair as
// fuel prices change. Update FUEL_PRICE_PER_LITRE to the latest pump price.
export const FUEL_PRICE_PER_LITRE = 102; // ₹ per litre (current petrol price)
export const PLATFORM_FEE_PERCENT = 10;  // Shiftzy app fee (collected by admin)
export const GST_PERCENT = 18;           // GST charged on the app fee

// Approx mileage (km/litre) + toll per km by category. Drives fuel cost.
export const FARE_CATEGORIES: Record<string, { mileage: number; tollPerKm: number; label: string }> = {
  bike:    { mileage: 45, tollPerKm: 0,   label: "Bike" },
  car:     { mileage: 18, tollPerKm: 1.5, label: "Budget Car" },
  suv:     { mileage: 12, tollPerKm: 2,   label: "SUV" },
  premium: { mileage: 10, tollPerKm: 2.5, label: "Premium" },
};

export interface FareBreakdown {
  distanceKm: number;
  fuelCost: number;
  tollCost: number;
  tripCost: number;    // fuel + toll (shared running cost)
  platformFee: number; // Shiftzy app fee → admin
  gst: number;         // GST on app fee
  total: number;       // amount payable
}

// Compute a transparent fare breakdown from distance + category + petrol price.
export function computeFare(distanceKm: number, category: string): FareBreakdown {
  const key = category in FARE_CATEGORIES ? category : (category === "luxury" ? "premium" : "car");
  const cfg = FARE_CATEGORIES[key];
  const fuelCost = Math.round((distanceKm / cfg.mileage) * FUEL_PRICE_PER_LITRE);
  const tollCost = Math.round(distanceKm * cfg.tollPerKm);
  const tripCost = fuelCost + tollCost;
  const platformFee = Math.round((tripCost * PLATFORM_FEE_PERCENT) / 100);
  const gst = Math.round((platformFee * GST_PERCENT) / 100);
  const total = tripCost + platformFee + gst;
  return { distanceKm, fuelCost, tollCost, tripCost, platformFee, gst, total };
}

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
  },
  {
    id: "suv",
    name: "SUV",
    icon: "truck",
  },
  {
    id: "luxury",
    name: "Luxury",
    icon: "gem",
  }
];

export const DETAILED_VEHICLE_TYPES = {
  car: [
    { name: "Maruti Alto", model: "2020 LXI", range: "Economy" },
    { name: "Hyundai i10", model: "2019 Magna", range: "Low" },
    { name: "Honda Amaze", model: "2021 S", range: "Mid" },
    { name: "Maruti Ciaz", model: "2022 ZXI", range: "Mid-High" },
    { name: "Honda City", model: "2023 ZX", range: "High" },
    { name: "Skoda Slavia", model: "2024 Style", range: "Luxury" }
  ],
  bike: [
    { name: "TVS Sport", model: "2020 Kick Start", range: "Economy" },
    { name: "Hero Splendor", model: "2021 iSmart", range: "Low" },
    { name: "Bajaj Pulsar 150", model: "2022 DTS-i", range: "Mid" },
    { name: "Yamaha FZ", model: "2023 V3", range: "Mid-High" },
    { name: "Royal Enfield Classic 350", model: "2023 Signals", range: "High" },
    { name: "Kawasaki Ninja 300", model: "2024 KRT", range: "Luxury" }
  ],
  suv: [
    { name: "Renault Kiger", model: "2021 RXL", range: "Economy" },
    { name: "Tata Nexon", model: "2022 XZ", range: "Low" },
    { name: "Hyundai Creta", model: "2023 SX", range: "Mid" },
    { name: "Kia Seltos", model: "2023 HTX", range: "Mid-High" },
    { name: "MG Hector", model: "2024 Sharp", range: "High" },
    { name: "Toyota Fortuner", model: "2024 Legender", range: "Luxury" }
  ],
  luxury: [
    { name: "BMW 3 Series", model: "2023 Sport", range: "Entry Luxury" },
    { name: "Audi A4", model: "2023 Premium Plus", range: "Luxury" },
    { name: "Mercedes C-Class", model: "2024 Avantgarde", range: "Luxury" },
    { name: "Jaguar XF", model: "2024 Prestige", range: "Luxury" },
    { name: "Land Rover Discovery", model: "2024 R-Dynamic", range: "Premium SUV" },
    { name: "Lexus RX500h", model: "2024 F Sport", range: "Top Luxury" }
  ]
};

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
      name: "Bangalore",
      address: "Bangalore, Karnataka"
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
    comment: "I needed to transport my bike to my hometown urgently, and Shiftzy Go made it so easy. The driver was professional and kept me updated."
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
  // Cars - 6 options
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
  },
  {
    id: "av3",
    type: "car",
    make: "Maruti",
    model: "Swift",
    registrationNumber: "TN 06 EF 9012",
    fuelType: "Petrol",
    seatingCapacity: 5,
    image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d",
    ownerId: "u4",
    ownerName: "Karthik R.",
    rating: 4.8,
    availabilityStatus: "available",
    features: ["Economical", "Available Now"],
    pricePerDay: 1800
  },
  {
    id: "av4",
    type: "car",
    make: "Honda",
    model: "City",
    registrationNumber: "TN 08 GH 3456",
    fuelType: "Petrol",
    seatingCapacity: 5,
    image: "https://images.unsplash.com/photo-1533106418989-88406c7cc8ca",
    ownerId: "u5",
    ownerName: "Divya P.",
    rating: 4.6,
    availabilityStatus: "available",
    features: ["Bluetooth", "Available Now"],
    pricePerDay: 2200
  },
  {
    id: "av5",
    type: "car",
    make: "Kia",
    model: "Seltos",
    registrationNumber: "TN 11 IJ 7890",
    fuelType: "Diesel",
    seatingCapacity: 5,
    image: "https://images.unsplash.com/photo-1609521263047-f8f205293f24",
    ownerId: "u6",
    ownerName: "Sanjay N.",
    rating: 4.7,
    availabilityStatus: "available-tomorrow",
    features: ["Sunroof", "Available Tomorrow"],
    pricePerDay: 2900
  },
  {
    id: "av6",
    type: "car",
    make: "Tata",
    model: "Nexon",
    registrationNumber: "TN 14 KL 1234",
    fuelType: "Petrol",
    seatingCapacity: 5,
    image: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2",
    ownerId: "u7",
    ownerName: "Vikram S.",
    rating: 4.5,
    availabilityStatus: "available",
    features: ["5-Star Safety", "Available Now"],
    pricePerDay: 2400
  },
  
  // Bikes - 6 options
  {
    id: "av7",
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
    id: "av8",
    type: "bike",
    make: "TVS",
    model: "Apache RTR 160",
    registrationNumber: "TN 16 MN 5678",
    fuelType: "Petrol",
    image: "https://images.unsplash.com/photo-1626269555258-3a239f90dccf",
    ownerId: "u8",
    ownerName: "Rahul V.",
    rating: 4.3,
    availabilityStatus: "available",
    features: ["Sport", "Available Now"],
    pricePerDay: 800
  },
  {
    id: "av9",
    type: "bike",
    make: "Bajaj",
    model: "Pulsar NS200",
    registrationNumber: "TN 18 OP 9012",
    fuelType: "Petrol",
    image: "https://images.unsplash.com/photo-1632266093059-9aebb514a27e",
    ownerId: "u9",
    ownerName: "Arjun M.",
    rating: 4.6,
    availabilityStatus: "available",
    features: ["Performance", "Available Now"],
    pricePerDay: 950
  },
  {
    id: "av10",
    type: "bike",
    make: "Hero",
    model: "Xpulse 200",
    registrationNumber: "TN 20 QR 3456",
    fuelType: "Petrol",
    image: "https://images.unsplash.com/photo-1609780447631-05b93e5a88ea",
    ownerId: "u10",
    ownerName: "Vijay T.",
    rating: 4.4,
    availabilityStatus: "available-tomorrow",
    features: ["Off-Road", "Available Tomorrow"],
    pricePerDay: 1000
  },
  {
    id: "av11",
    type: "bike",
    make: "Yamaha",
    model: "R15",
    registrationNumber: "TN 22 ST 7890",
    fuelType: "Petrol",
    image: "https://images.unsplash.com/photo-1635073908681-69d1926b8911",
    ownerId: "u11",
    ownerName: "Pravin K.",
    rating: 4.7,
    availabilityStatus: "available",
    features: ["Race", "Available Now"],
    pricePerDay: 1100
  },
  {
    id: "av12",
    type: "bike",
    make: "KTM",
    model: "Duke 390",
    registrationNumber: "TN 24 UV 1234",
    fuelType: "Petrol",
    image: "https://images.unsplash.com/photo-1615207757930-a68d3c4c7252",
    ownerId: "u12",
    ownerName: "Mohan L.",
    rating: 4.8,
    availabilityStatus: "available",
    features: ["Premium", "Available Now"],
    pricePerDay: 1400
  },
  
  // SUVs - 6 options
  {
    id: "av13",
    type: "suv",
    make: "Mahindra",
    model: "Scorpio",
    registrationNumber: "TN 26 WX 5678",
    fuelType: "Diesel",
    seatingCapacity: 7,
    image: "https://images.unsplash.com/photo-1609780447631-05b93e5a88ea",
    ownerId: "u13",
    ownerName: "Harish G.",
    rating: 4.6,
    availabilityStatus: "available",
    features: ["Rugged", "Available Now"],
    pricePerDay: 3200
  },
  {
    id: "av14",
    type: "suv",
    make: "Mahindra",
    model: "XUV700",
    registrationNumber: "TN 28 YZ 9012",
    fuelType: "Diesel",
    seatingCapacity: 7,
    image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738",
    ownerId: "u14",
    ownerName: "Kiruthika S.",
    rating: 4.9,
    availabilityStatus: "available-tomorrow",
    features: ["Luxury", "Available Tomorrow"],
    pricePerDay: 3800
  },
  {
    id: "av15",
    type: "suv",
    make: "Tata",
    model: "Harrier",
    registrationNumber: "TN 30 AB 3456",
    fuelType: "Diesel",
    seatingCapacity: 5,
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf",
    ownerId: "u15",
    ownerName: "Ramesh B.",
    rating: 4.7,
    availabilityStatus: "available",
    features: ["Panoramic Sunroof", "Available Now"],
    pricePerDay: 3600
  },
  {
    id: "av16",
    type: "suv",
    make: "MG",
    model: "Hector",
    registrationNumber: "TN 32 CD 7890",
    fuelType: "Petrol",
    seatingCapacity: 5,
    image: "https://images.unsplash.com/photo-1550355291-bbee04a92027",
    ownerId: "u16",
    ownerName: "Lakshmi R.",
    rating: 4.8,
    availabilityStatus: "available",
    features: ["Connected Car", "Available Now"],
    pricePerDay: 3500
  },
  {
    id: "av17",
    type: "suv",
    make: "Hyundai",
    model: "Venue",
    registrationNumber: "TN 34 EF 1234",
    fuelType: "Petrol",
    seatingCapacity: 5,
    image: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2",
    ownerId: "u17",
    ownerName: "Prabhu N.",
    rating: 4.5,
    availabilityStatus: "available-tomorrow",
    features: ["Compact", "Available Tomorrow"],
    pricePerDay: 2600
  },
  {
    id: "av18",
    type: "suv",
    make: "Jeep",
    model: "Compass",
    registrationNumber: "TN 36 GH 5678",
    fuelType: "Diesel",
    seatingCapacity: 5,
    image: "https://images.unsplash.com/photo-1533106418989-88406c7cc8ca",
    ownerId: "u18",
    ownerName: "Shreya K.",
    rating: 4.7,
    availabilityStatus: "available",
    features: ["Premium", "Available Now"],
    pricePerDay: 3900
  },
  
  // Luxury - 6 options
  {
    id: "av19",
    type: "luxury",
    make: "BMW",
    model: "5 Series",
    registrationNumber: "TN 38 IJ 9012",
    fuelType: "Petrol",
    seatingCapacity: 5,
    image: "https://images.unsplash.com/photo-1520050206274-a1ae44613e6d",
    ownerId: "u19",
    ownerName: "Aditya P.",
    rating: 4.9,
    availabilityStatus: "available",
    features: ["Luxury", "Premium Sound", "Available Now"],
    pricePerDay: 8500
  },
  {
    id: "av20",
    type: "luxury",
    make: "Mercedes",
    model: "E-Class",
    registrationNumber: "TN 40 KL 3456",
    fuelType: "Diesel",
    seatingCapacity: 5,
    image: "https://images.unsplash.com/photo-1583267746897-2cf415887172",
    ownerId: "u20",
    ownerName: "Nikita M.",
    rating: 4.8,
    availabilityStatus: "available-tomorrow",
    features: ["Business Class", "Leather Seats", "Available Tomorrow"],
    pricePerDay: 9000
  },
  {
    id: "av21",
    type: "luxury",
    make: "Audi",
    model: "A6",
    registrationNumber: "TN 42 MN 7890",
    fuelType: "Petrol",
    seatingCapacity: 5,
    image: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a",
    ownerId: "u21",
    ownerName: "Rajiv C.",
    rating: 4.9,
    availabilityStatus: "available",
    features: ["Quattro", "Sunroof", "Available Now"],
    pricePerDay: 8800
  },
  {
    id: "av22",
    type: "luxury",
    make: "Jaguar",
    model: "XF",
    registrationNumber: "TN 44 OP 1234",
    fuelType: "Petrol",
    seatingCapacity: 5,
    image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537",
    ownerId: "u22",
    ownerName: "Deepak S.",
    rating: 4.7,
    availabilityStatus: "available",
    features: ["British Luxury", "Premium Interiors", "Available Now"],
    pricePerDay: 9500
  },
  {
    id: "av23",
    type: "luxury",
    make: "Lexus",
    model: "ES",
    registrationNumber: "TN 46 QR 5678",
    fuelType: "Hybrid",
    seatingCapacity: 5,
    image: "https://images.unsplash.com/photo-1546614042-7df3c24c9e5d",
    ownerId: "u23",
    ownerName: "Sneha V.",
    rating: 4.8,
    availabilityStatus: "available-tomorrow",
    features: ["Japanese Luxury", "Eco-Friendly", "Available Tomorrow"],
    pricePerDay: 8200
  },
  {
    id: "av24",
    type: "luxury",
    make: "Land Rover",
    model: "Range Rover Sport",
    registrationNumber: "TN 48 ST 9012",
    fuelType: "Diesel",
    seatingCapacity: 5,
    image: "https://images.unsplash.com/photo-1526626607369-f89e339bee41",
    ownerId: "u24",
    ownerName: "Ajith K.",
    rating: 4.9,
    availabilityStatus: "available",
    features: ["Luxury SUV", "Off-Road Capability", "Available Now"],
    pricePerDay: 10500
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

// Version 1 supported cities only.
export const LOCATIONS = [
  "Chennai",
  "Bangalore",
  "Coimbatore",
  "Madurai",
  "Pondicherry"
];

export const CHENNAI_LOCALITIES = [
  "Mambakkam", 
  "Avadi", 
  "Kelambakkam", 
  "Thiruvallur", 
  "Anna Nagar", 
  "T Nagar", 
  "Adyar", 
  "Velachery", 
  "Porur", 
  "Chromepet", 
  "Tambaram", 
  "Sholinganallur", 
  "Perungudi", 
  "Siruseri",
  "Kodambakkam",
  "Besant Nagar",
  "Nungambakkam",
  "Mylapore",
  "OMR",
  "ECR"
];

export const SAMPLE_REVIEWS: Review[] = [
  {
    id: "r1",
    userName: "Aditya Singh",
    userAvatar: "https://ui-avatars.com/api/?name=Aditya+Singh&background=0D8ABC&color=fff",
    rating: 5,
    comment: "Very smooth ride! The vehicle was clean and well-maintained. Would definitely book again!",
    date: "2023-06-20",
    metrics: {
      comfort: 5,
      cleanliness: 5,
      performance: 4
    }
  },
  {
    id: "r2",
    userName: "Priya Patel",
    userAvatar: "https://ui-avatars.com/api/?name=Priya+Patel&background=FF6B6B&color=fff",
    rating: 4,
    comment: "Great experience overall. The car was comfortable and the process was hassle-free.",
    date: "2023-07-12",
    metrics: {
      comfort: 4,
      cleanliness: 4,
      performance: 5
    }
  },
  {
    id: "r3",
    userName: "Raj Malhotra",
    rating: 3,
    comment: "Decent ride, but the vehicle had some minor issues with the air conditioning.",
    date: "2023-08-05",
    vehicleDetails: {
      make: "Honda",
      model: "City"
    },
    metrics: {
      comfort: 3,
      cleanliness: 4,
      performance: 3
    }
  },
  {
    id: "r4",
    userName: "Sunita Kapoor",
    userAvatar: "https://ui-avatars.com/api/?name=Sunita+Kapoor&background=F39C12&color=fff",
    rating: 5,
    comment: "Amazing service! The owner was very accommodating with the pickup and drop-off times.",
    date: "2023-07-25",
    vehicleDetails: {
      make: "Toyota",
      model: "Fortuner"
    }
  },
  {
    id: "r5",
    userName: "Karthik Raman",
    userAvatar: "https://ui-avatars.com/api/?name=Karthik+Raman&background=2ECC71&color=fff",
    rating: 4,
    comment: "Good vehicle condition, enjoyed driving it. Just a bit of delay in handover.",
    date: "2023-08-15",
    metrics: {
      comfort: 4,
      cleanliness: 3,
      performance: 5
    }
  }
];

export const LOCAL_SHIFT_REQUESTS: ShiftRequest[] = [
  // Bike requests
  {
    id: "lsr1",
    userId: 7,
    userName: "Rajan K.",
    userAvatar: "https://images.unsplash.com/photo-1603415526960-f7e0328c63b1",
    vehicle: {
      id: "v9",
      type: "bike",
      make: "Royal Enfield",
      model: "Classic 350",
      registrationNumber: "TN 04 RE 3500",
      image: "https://images.unsplash.com/photo-1558979159-2b18a4070a87",
    },
    pickupLocation: {
      id: "loc_mambakkam",
      name: "Mambakkam",
      address: "Mambakkam, Chennai"
    },
    dropLocation: {
      id: "loc_avadi",
      name: "Avadi",
      address: "Avadi, Chennai"
    },
    pickupTime: "09:30 AM (Tomorrow)",
    distance: "28 km",
    estimatedDuration: "50m",
    reward: 150,
    postedTime: "2 hours ago",
    status: "pending"
  },
  {
    id: "lsr2",
    userId: 10,
    userName: "Arun N.",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
    vehicle: {
      id: "v12",
      type: "bike",
      make: "TVS",
      model: "Apache",
      registrationNumber: "TN 01 TV 9876",
      image: "https://images.unsplash.com/photo-1558981001-5864b3250a69",
    },
    pickupLocation: {
      id: "loc_tambaram",
      name: "Tambaram",
      address: "Tambaram, Chennai"
    },
    dropLocation: {
      id: "loc_tnagar",
      name: "T Nagar",
      address: "T Nagar, Chennai"
    },
    pickupTime: "08:00 AM",
    distance: "22 km",
    estimatedDuration: "50m",
    reward: 150,
    postedTime: "30 minutes ago",
    status: "pending"
  },
  
  // Car requests
  {
    id: "lsr3",
    userId: 8,
    userName: "Lakshmi S.",
    userAvatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604",
    vehicle: {
      id: "v10",
      type: "car",
      make: "Maruti",
      model: "Swift",
      registrationNumber: "TN 07 MS 1234",
      image: "https://images.unsplash.com/photo-1523676060187-f55189a71f5e",
    },
    pickupLocation: {
      id: "loc_kelambakkam",
      name: "Kelambakkam",
      address: "Kelambakkam, Chennai"
    },
    dropLocation: {
      id: "loc_thiruvallur",
      name: "Thiruvallur",
      address: "Thiruvallur, Chennai"
    },
    pickupTime: "11:00 AM",
    distance: "45 km",
    estimatedDuration: "1h 15m",
    reward: 270,
    postedTime: "1 hour ago",
    status: "pending"
  },
  {
    id: "lsr4",
    userId: 9,
    userName: "Deepak V.",
    userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
    vehicle: {
      id: "v11",
      type: "car",
      make: "Hyundai",
      model: "i10",
      registrationNumber: "TN 05 HY 5678",
      image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d",
    },
    pickupLocation: {
      id: "loc_adyar",
      name: "Adyar",
      address: "Adyar, Chennai"
    },
    dropLocation: {
      id: "loc_porur",
      name: "Porur",
      address: "Porur, Chennai"
    },
    pickupTime: "02:00 PM (Tomorrow)",
    distance: "15 km",
    estimatedDuration: "40m",
    reward: 200,
    postedTime: "3 hours ago",
    status: "pending"
  },
  
  // SUV requests
  {
    id: "lsr5",
    userId: 11,
    userName: "Karthik N.",
    userAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d",
    vehicle: {
      id: "v13",
      type: "suv",
      make: "Mahindra",
      model: "XUV700",
      registrationNumber: "TN 10 MX 7890",
      image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738",
    },
    pickupLocation: {
      id: "loc_omr",
      name: "OMR",
      address: "OMR, Chennai"
    },
    dropLocation: {
      id: "loc_mylapore",
      name: "Mylapore",
      address: "Mylapore, Chennai"
    },
    pickupTime: "09:00 AM",
    distance: "22 km",
    estimatedDuration: "50m",
    reward: 200,
    postedTime: "4 hours ago",
    status: "pending"
  },
  {
    id: "lsr6",
    userId: 12,
    userName: "Preethi R.",
    userAvatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e",
    vehicle: {
      id: "v14",
      type: "suv",
      make: "Hyundai",
      model: "Creta",
      registrationNumber: "TN 15 HC 4321",
      image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738",
    },
    pickupLocation: {
      id: "loc_nungambakkam",
      name: "Nungambakkam",
      address: "Nungambakkam, Chennai"
    },
    dropLocation: {
      id: "loc_ecr",
      name: "ECR",
      address: "ECR, Chennai"
    },
    pickupTime: "04:30 PM",
    distance: "26 km",
    estimatedDuration: "1h",
    reward: 200,
    postedTime: "5 hours ago",
    status: "pending"
  },
  
  // Luxury requests
  {
    id: "lsr7",
    userId: 13,
    userName: "Shreya M.",
    userAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2",
    vehicle: {
      id: "v15",
      type: "luxury",
      make: "BMW",
      model: "3 Series",
      registrationNumber: "TN 20 BM 9876",
      image: "https://images.unsplash.com/photo-1520050206274-a1ae44613e6d",
    },
    pickupLocation: {
      id: "loc_velachery",
      name: "Velachery",
      address: "Velachery, Chennai"
    },
    dropLocation: {
      id: "loc_chromepet",
      name: "Chromepet",
      address: "Chromepet, Chennai"
    },
    pickupTime: "10:30 AM",
    distance: "15 km",
    estimatedDuration: "35m",
    reward: 200,
    postedTime: "2 hours ago",
    status: "pending"
  },
  {
    id: "lsr8",
    userId: 14,
    userName: "Rohan D.",
    userAvatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857",
    vehicle: {
      id: "v16",
      type: "luxury",
      make: "Mercedes",
      model: "C-Class",
      registrationNumber: "TN 25 MB 5432",
      image: "https://images.unsplash.com/photo-1583267746897-2cf415887172",
    },
    pickupLocation: {
      id: "loc_siruseri",
      name: "Siruseri",
      address: "Siruseri, Chennai"
    },
    dropLocation: {
      id: "loc_kodambakkam",
      name: "Kodambakkam",
      address: "Kodambakkam, Chennai"
    },
    pickupTime: "02:00 PM (Tomorrow)",
    distance: "35 km",
    estimatedDuration: "1h 10m",
    reward: 280,
    postedTime: "30 minutes ago",
    status: "pending"
  }
];

export const NEARBY_SHIFT_REQUESTS: ShiftRequest[] = [
  {
    id: "sr1",
    userId: 1,
    userName: "Ramu S.",
    userAvatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36",
    vehicle: {
      id: "v3",
      type: "car",
      make: "Hyundai",
      model: "i20",
      registrationNumber: "TN 02 CD 9876",
      image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537",
    },
    pickupLocation: {
      id: "loc1",
      name: "Chennai",
      address: "Anna Nagar, Chennai"
    },
    dropLocation: {
      id: "loc2",
      name: "Bangalore",
      address: "Electronic City, Bangalore"
    },
    pickupTime: "10:30 AM",
    distance: "350 km",
    estimatedDuration: "5h 30m",
    reward: 2100,
    rating: 4.8,
    postedTime: "1 hour ago",
    status: "pending"
  },
  {
    id: "sr2",
    userId: 2,
    userName: "Janu K.",
    userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    vehicle: {
      id: "v4",
      type: "bike",
      make: "KTM",
      model: "Duke 390",
      registrationNumber: "TN 09 AB 4567",
      image: "https://images.unsplash.com/photo-1571646750134-c2ce9552538e",
    },
    pickupLocation: {
      id: "loc1",
      name: "Chennai",
      address: "Velachery, Chennai"
    },
    dropLocation: {
      id: "loc7",
      name: "Pondicherry",
      address: "White Town, Pondicherry"
    },
    pickupTime: "12:45 PM",
    distance: "160 km",
    estimatedDuration: "2h 45m",
    reward: 800,
    rating: 4.6,
    postedTime: "2 hours ago",
    status: "pending"
  },
  {
    id: "sr3",
    userId: 3,
    userName: "Arjun V.",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
    vehicle: {
      id: "v5",
      type: "suv",
      make: "Mahindra",
      model: "XUV 700",
      registrationNumber: "TN 06 FG 3214",
      image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
    },
    pickupLocation: {
      id: "loc1",
      name: "Chennai",
      address: "T Nagar, Chennai"
    },
    dropLocation: {
      id: "loc4",
      name: "Coimbatore",
      address: "Peelamedu, Coimbatore"
    },
    pickupTime: "09:00 AM (Tomorrow)",
    distance: "510 km",
    estimatedDuration: "7h 15m",
    reward: 3570,
    rating: 4.9,
    postedTime: "30 minutes ago",
    status: "pending"
  },
  {
    id: "sr4",
    userId: 4,
    userName: "Karthik R.",
    userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
    vehicle: {
      id: "v6",
      type: "car",
      make: "Honda",
      model: "Amaze",
      registrationNumber: "TN 01 HK 8765",
      image: "https://images.unsplash.com/photo-1609521263047-f8f205293f24",
    },
    pickupLocation: {
      id: "loc1",
      name: "Chennai",
      address: "Chromepet, Chennai"
    },
    dropLocation: {
      id: "loc5",
      name: "Madurai",
      address: "Mattuthavani, Madurai"
    },
    pickupTime: "08:15 AM",
    distance: "450 km",
    estimatedDuration: "6h 45m",
    reward: 2700,
    rating: 4.7,
    postedTime: "3 hours ago",
    status: "pending"
  },
  {
    id: "sr5",
    userId: 5,
    userName: "Meena T.",
    userAvatar: "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56",
    vehicle: {
      id: "v7",
      type: "luxury",
      make: "Mercedes",
      model: "C-Class",
      registrationNumber: "TN 01 MN 0001",
      image: "https://images.unsplash.com/photo-1553440569-bcc63803a83d",
    },
    pickupLocation: {
      id: "loc1",
      name: "Chennai",
      address: "Adyar, Chennai"
    },
    dropLocation: {
      id: "loc8",
      name: "Bangalore",
      address: "MG Road, Bangalore"
    },
    pickupTime: "11:00 AM (Tomorrow)",
    distance: "350 km",
    estimatedDuration: "5h 30m",
    reward: 5480,
    rating: 5.0,
    postedTime: "45 minutes ago",
    status: "pending"
  },
  {
    id: "sr6",
    userId: 6,
    userName: "Govind P.",
    userAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d",
    vehicle: {
      id: "v8",
      type: "bike",
      make: "Bajaj",
      model: "Pulsar 220",
      registrationNumber: "TN 11 GP 4321",
      image: "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f",
    },
    pickupLocation: {
      id: "loc1",
      name: "Chennai",
      address: "Porur, Chennai"
    },
    dropLocation: {
      id: "loc6",
      name: "Coimbatore",
      address: "Gandhipuram, Coimbatore"
    },
    pickupTime: "02:30 PM",
    distance: "510 km",
    estimatedDuration: "7h 15m",
    reward: 1400,
    rating: 4.5,
    postedTime: "4 hours ago",
    status: "pending"
  }
];
