import { Testimonial, Vehicle, Trip, ShiftRequest } from "./types";

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

export const LOCAL_SHIFT_REQUESTS: ShiftRequest[] = [
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
    reward: 300,
    postedTime: "2 hours ago",
    status: "pending"
  },
  {
    id: "lsr2",
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
    reward: 600,
    postedTime: "1 hour ago",
    status: "pending"
  },
  {
    id: "lsr3",
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
    reward: 400,
    postedTime: "3 hours ago",
    status: "pending"
  },
  {
    id: "lsr4",
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
    reward: 350,
    postedTime: "30 minutes ago",
    status: "pending"
  },
  {
    id: "lsr5",
    userId: 11,
    userName: "Preethi M.",
    userAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
    vehicle: {
      id: "v13",
      type: "car",
      make: "Tata",
      model: "Nexon",
      registrationNumber: "TN 09 TA 4567",
      image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738",
    },
    pickupLocation: {
      id: "loc_sholinganallur",
      name: "Sholinganallur",
      address: "Sholinganallur, Chennai"
    },
    dropLocation: {
      id: "loc_annanagar",
      name: "Anna Nagar",
      address: "Anna Nagar, Chennai"
    },
    pickupTime: "10:30 AM (Tomorrow)",
    distance: "30 km",
    estimatedDuration: "1h",
    reward: 500,
    postedTime: "2 hours ago",
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
    reward: 2000,
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
    reward: 900,
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
    reward: 3500,
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
    reward: 2800,
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
      name: "Kochi",
      address: "Marine Drive, Kochi"
    },
    pickupTime: "11:00 AM (Tomorrow)",
    distance: "685 km",
    estimatedDuration: "10h",
    reward: 5000,
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
      name: "Salem",
      address: "Shevapet, Salem"
    },
    pickupTime: "02:30 PM",
    distance: "350 km",
    estimatedDuration: "5h",
    reward: 1200,
    postedTime: "4 hours ago",
    status: "pending"
  }
];
