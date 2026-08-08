// ============================================================
// SEED — Comprehensive demo data for the booking marketplace
// Run via: bun run scripts/seed.ts
// ============================================================

import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth";

const db = new PrismaClient();

const IMG = {
  // Hotel hero images (Unsplash, free to use)
  hotels: [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80",
    "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200&q=80",
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80",
    "https://images.unsplash.com/photo-1559508551-44bff1de756b?w=1200&q=80",
  ],
  hotelRooms: [
    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&q=80",
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80",
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80",
    "https://images.unsplash.com/photo-1566195992011-5f6b21e539aa?w=1200&q=80",
    "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=1200&q=80",
  ],
  cars: [
    "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1200&q=80",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80",
    "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&q=80",
    "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1200&q=80",
    "https://images.unsplash.com/photo-1542362567-b07e54358753?w=1200&q=80",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80",
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&q=80",
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&q=80",
  ],
  destinations: [
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80",
    "https://images.unsplash.com/photo-1513581166391-887a96ddeafd?w=1200&q=80",
    "https://images.unsplash.com/photo-1538970272646-f61fabb3a8a2?w=1200&q=80",
    "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200&q=80",
    "https://images.unsplash.com/photo-1513735492246-483525079686?w=1200&q=80",
    "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1200&q=80",
  ],
  avatars: [
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80",
  ],
};

const AMENITIES_HOTEL = [
  "Free WiFi", "Pool", "Spa", "Fitness Center", "Restaurant", "Bar",
  "Parking", "Airport Shuttle", "Concierge", "Room Service", "Business Center",
  "Pet Friendly", "Beach Access", "Hot Tub", "Sauna", "Air Conditioning",
  "Ocean View", "Mountain View", "Balcony", "Kitchenette",
];

const CAR_FEATURES = [
  "Bluetooth", "Backup Camera", "Apple CarPlay", "Android Auto", "Leather Seats",
  "Sunroof", "Heated Seats", "GPS Navigation", "Cruise Control", "Air Conditioning",
  "USB Charging", "Keyless Entry", "Push Button Start", "Lane Assist", "Auto Emergency Brake",
  "Premium Sound System", "Parking Sensors", "Roof Rack", "Tow Hitch", "4WD",
];

const HOTEL_AMENITIES = ["pool","spa","fitness","restaurant","bar","parking","wifi","shuttle","concierge","room-service","business","pet-friendly","beach","hot-tub","sauna","ac","ocean-view","mountain-view","balcony","kitchenette"];

function pick<T>(arr: T[], n: number): T[] {
  const out: T[] = [];
  const c = [...arr];
  for (let i = 0; i < n && c.length; i++) {
    const idx = Math.floor(Math.random() * c.length);
    out.push(c.splice(idx, 1)[0]);
  }
  return out;
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function main() {
  console.log("🌱 Seeding database...");

  // Clean
  await db.notification.deleteMany();
  await db.auditLog.deleteMany();
  await db.favorite.deleteMany();
  await db.review.deleteMany();
  await db.payment.deleteMany();
  await db.booking.deleteMany();
  await db.carAvailability.deleteMany();
  await db.car.deleteMany();
  await db.hotelRoom.deleteMany();
  await db.hotel.deleteMany();
  await db.destination.deleteMany();
  await db.owner.deleteMany();
  await db.userProfile.deleteMany();
  await db.session.deleteMany();
  await db.user.deleteMany();
  await db.promotion.deleteMany();

  // ============== Users ==============
  console.log("  → Creating users...");
  const admin = await db.user.create({
    data: {
      email: "admin@voyarion.com",
      name: "Isabella Reyes",
      passwordHash: hashPassword("admin123"),
      role: "SUPER_ADMIN",
      avatarUrl: IMG.avatars[0],
      phone: "+1-415-555-0100",
      profile: { create: { firstName: "Isabella", lastName: "Reyes" } },
    },
  });

  const customer1 = await db.user.create({
    data: {
      email: "guest@voyarion.com",
      name: "Marco Bianchi",
      passwordHash: hashPassword("guest123"),
      role: "CUSTOMER",
      avatarUrl: IMG.avatars[1],
      phone: "+1-415-555-0101",
      profile: { create: { firstName: "Marco", lastName: "Bianchi", city: "San Francisco", country: "USA" } },
    },
  });
  const customer2 = await db.user.create({
    data: {
      email: "sophia@example.com",
      name: "Sophia Lindqvist",
      passwordHash: hashPassword("guest123"),
      role: "CUSTOMER",
      avatarUrl: IMG.avatars[2],
      phone: "+46-70-555-0102",
      profile: { create: { firstName: "Sophia", lastName: "Lindqvist", city: "Stockholm", country: "Sweden" } },
    },
  });
  const customer3 = await db.user.create({
    data: {
      email: "amelia@example.com",
      name: "Amelia Tanaka",
      passwordHash: hashPassword("guest123"),
      role: "CUSTOMER",
      avatarUrl: IMG.avatars[3],
      phone: "+81-90-5555-0103",
      profile: { create: { firstName: "Amelia", lastName: "Tanaka", city: "Tokyo", country: "Japan" } },
    },
  });

  // Owner users
  const ownerUser1 = await db.user.create({
    data: {
      email: "owner@voyarion.com",
      name: "Diego Santos",
      passwordHash: hashPassword("owner123"),
      role: "OWNER",
      avatarUrl: IMG.avatars[3],
      phone: "+55-11-95555-0104",
      owner: {
        create: {
          displayName: "Santos Premium Rentals",
          verified: true,
          businessName: "Santos Premium Rentals LLC",
          payoutMethod: "STRIPE_CONNECT",
          rating: 4.92,
          totalEarnings: 48230.50,
          pendingPayouts: 6240.00,
          completedPayouts: 41990.50,
          responseRate: 98,
          responseTime: 45,
        },
      },
      profile: { create: { firstName: "Diego", lastName: "Santos", city: "São Paulo", country: "Brazil" } },
    },
    include: { owner: true },
  });
  const ownerUser2 = await db.user.create({
    data: {
      email: "maria@luxedrive.com",
      name: "Maria Chen",
      passwordHash: hashPassword("owner123"),
      role: "OWNER",
      avatarUrl: IMG.avatars[2],
      phone: "+1-310-555-0105",
      owner: {
        create: {
          displayName: "LuxeDrive LA",
          verified: true,
          businessName: "LuxeDrive Los Angeles Inc",
          payoutMethod: "STRIPE_CONNECT",
          rating: 4.87,
          totalEarnings: 73120.00,
          pendingPayouts: 8950.00,
          completedPayouts: 64170.00,
          responseRate: 96,
          responseTime: 60,
        },
      },
      profile: { create: { firstName: "Maria", lastName: "Chen", city: "Los Angeles", country: "USA" } },
    },
    include: { owner: true },
  });
  const ownerUser3 = await db.user.create({
    data: {
      email: "james@coastalcars.com",
      name: "James Okonkwo",
      passwordHash: hashPassword("owner123"),
      role: "OWNER",
      avatarUrl: IMG.avatars[1],
      phone: "+44-7700-900-106",
      owner: {
        create: {
          displayName: "Coastal Cars UK",
          verified: true,
          businessName: "Coastal Cars UK Ltd",
          payoutMethod: "BANK_TRANSFER",
          rating: 4.79,
          totalEarnings: 31480.75,
          pendingPayouts: 4120.00,
          completedPayouts: 27360.75,
          responseRate: 94,
          responseTime: 90,
        },
      },
      profile: { create: { firstName: "James", lastName: "Okonkwo", city: "London", country: "UK" } },
    },
    include: { owner: true },
  });

  // ============== Destinations ==============
  console.log("  → Creating destinations...");
  const destinations = [
    { name: "Santorini", country: "Greece", desc: "Whitewashed cliffs above the Aegean Sea, famous for sunsets and blue-domed churches.", img: IMG.destinations[0] },
    { name: "Bali", country: "Indonesia", desc: "Lush rice terraces, sacred temples, and beach clubs on the Island of the Gods.", img: IMG.destinations[1] },
    { name: "Kyoto", country: "Japan", desc: "Ancient temples, geisha districts, and serene bamboo forests in Japan's old capital.", img: IMG.destinations[2] },
    { name: "Paris", country: "France", desc: "The City of Light — romance, haute cuisine, and timeless art along the Seine.", img: IMG.destinations[3] },
    { name: "Maldives", country: "Maldives", desc: "Overwater villas and crystal-clear lagoons in the ultimate island paradise.", img: IMG.destinations[4] },
    { name: "Tuscany", country: "Italy", desc: "Rolling vineyards, medieval hill towns, and Renaissance art in the heart of Italy.", img: IMG.destinations[5] },
  ];
  const destRecords = [];
  for (const d of destinations) {
    const r = await db.destination.create({
      data: {
        slug: slugify(d.name),
        name: d.name,
        country: d.country,
        description: d.desc,
        heroImage: d.img,
        imageGallery: JSON.stringify([d.img, d.img, d.img]),
        popularity: Math.floor(Math.random() * 1000),
      },
    });
    destRecords.push(r);
  }

  // ============== Hotels ==============
  console.log("  → Creating hotels & rooms...");
  const hotelData = [
    { name: "Aegean Pearl Resort", dest: "Santorini", city: "Santorini", country: "Greece", type: "RESORT", priceFrom: 420, rating: 4.9, reviews: 1248, featured: true, img: IMG.hotels[0], rules: ["No smoking in rooms","Quiet hours 22:00-08:00","Pets not allowed"], amenities: ["pool","spa","fitness","restaurant","bar","wifi","shuttle","concierge","room-service","beach","ocean-view","ac"] },
    { name: "Caldera Cliff Villas", dest: "Santorini", city: "Santorini", country: "Greece", type: "VILLA", priceFrom: 680, rating: 4.95, reviews: 856, featured: true, img: IMG.hotels[1], rules: ["No parties","Adults only (16+)"], amenities: ["pool","wifi","concierge","room-service","ocean-view","balcony","kitchenette","hot-tub","ac"] },
    { name: "Ubud Jungle Sanctuary", dest: "Bali", city: "Ubud", country: "Indonesia", type: "RESORT", priceFrom: 280, rating: 4.85, reviews: 2104, featured: true, img: IMG.hotels[2], rules: ["No smoking","Respect local culture"], amenities: ["pool","spa","fitness","restaurant","bar","wifi","parking","concierge","room-service","sauna","mountain-view","ac"] },
    { name: "Sakura Ryokan Kyoto", dest: "Kyoto", city: "Kyoto", country: "Japan", type: "BOUTIQUE", priceFrom: 350, rating: 4.92, reviews: 678, featured: true, img: IMG.hotels[3], rules: ["Shoes off inside","No food in common areas"], amenities: ["spa","restaurant","bar","wifi","concierge","room-service","hot-tub","mountain-view","ac"] },
    { name: "Maison de la Seine", dest: "Paris", city: "Paris", country: "France", type: "BOUTIQUE", priceFrom: 395, rating: 4.78, reviews: 1542, featured: true, img: IMG.hotels[4], rules: ["No parties","Reception 24/7"], amenities: ["restaurant","bar","wifi","concierge","room-service","business","balcony","ac"] },
    { name: "Velaa Private Island", dest: "Maldives", city: "Maldives", country: "Maldives", type: "RESORT", priceFrom: 1450, rating: 4.97, reviews: 412, featured: true, img: IMG.hotels[5], rules: ["Adults only","No outside food"], amenities: ["pool","spa","fitness","restaurant","bar","wifi","shuttle","concierge","room-service","beach","ocean-view","hot-tub","sauna","ac"] },
    { name: "Borgo di Toscana", dest: "Tuscany", city: "Florence", country: "Italy", type: "VILLA", priceFrom: 520, rating: 4.88, reviews: 892, featured: false, img: IMG.hotels[6], rules: ["No smoking","Pets allowed on request"], amenities: ["pool","restaurant","bar","wifi","parking","concierge","kitchenette","mountain-view","balcony","pet-friendly","ac"] },
    { name: "Côte d'Azur Grand Hotel", dest: "Paris", city: "Nice", country: "France", type: "HOTEL", priceFrom: 380, rating: 4.74, reviews: 1876, featured: false, img: IMG.hotels[7], rules: ["No parties","Quiet hours"], amenities: ["pool","fitness","restaurant","bar","wifi","parking","concierge","room-service","business","beach","ocean-view","ac"] },
  ];

  const hotelRecords = [];
  for (let i = 0; i < hotelData.length; i++) {
    const h = hotelData[i];
    const dest = destRecords.find((d) => d.name === h.dest)!;
    const images = [h.img, ...IMG.hotels.filter((x) => x !== h.img).slice(0, 4)];
    const hotel = await db.hotel.create({
      data: {
        slug: slugify(h.name),
        name: h.name,
        description: `${h.name} is a premier ${h.type.toLowerCase()} in ${h.city}, ${h.country}. ${h.dest === "Santorini" ? "Perched on the cliffs with sweeping Aegean views," : h.dest === "Bali" ? "Nestled in tropical greenery with serene spa facilities," : h.dest === "Maldives" ? "Set on a private island with overwater villas," : "Set in a landmark location with timeless elegance,"} this property blends local character with world-class hospitality. Guests enjoy meticulously designed accommodations, award-winning dining, and a curated experience program. Our concierge team is available around the clock to ensure an unforgettable stay.`,
        shortLocation: `${h.city}, ${h.country}`,
        city: h.city,
        country: h.country,
        starRating: 5,
        reviewScore: h.rating,
        reviewCount: h.reviews,
        priceFrom: h.priceFrom,
        heroImage: h.img,
        images: JSON.stringify(images),
        amenities: JSON.stringify(h.amenities),
        propertyType: h.type,
        checkInTime: "15:00",
        checkOutTime: "11:00",
        houseRules: JSON.stringify(h.rules),
        status: "PUBLISHED",
        featured: h.featured,
        destinationId: dest.id,
      },
    });
    hotelRecords.push(hotel);

    // Create 3 room types per hotel
    const roomTypes = [
      { name: "Deluxe Garden Room", bed: "1 King Bed", max: 2, maxRooms: 8, price: h.priceFrom, img: IMG.hotelRooms[0], amenities: ["ac","wifi","balcony","room-service"], desc: "Spacious room with garden views, plush king bed, and marble bathroom." },
      { name: "Premier Ocean Suite", bed: "1 King + 1 Sofa Bed", max: 3, maxRooms: 4, price: Math.round(h.priceFrom * 1.6), img: IMG.hotelRooms[1], amenities: ["ac","wifi","balcony","ocean-view","room-service","kitchenette"], desc: "Luxurious suite with panoramic ocean views, separate lounge, and premium amenities." },
      { name: "Family Connecting Room", bed: "2 Queen Beds", max: 4, maxRooms: 3, price: Math.round(h.priceFrom * 1.3), img: IMG.hotelRooms[2], amenities: ["ac","wifi","balcony","kitchenette","room-service"], desc: "Two connecting rooms perfect for families, with extra space and modern amenities." },
    ];
    for (const rt of roomTypes) {
      await db.hotelRoom.create({
        data: {
          hotelId: hotel.id,
          name: rt.name,
          description: rt.desc,
          bedConfig: rt.bed,
          maxGuests: rt.max,
          maxRooms: rt.maxRooms,
          pricePerNight: rt.price,
          images: JSON.stringify([rt.img, IMG.hotelRooms[3], IMG.hotelRooms[4]]),
          amenities: JSON.stringify(rt.amenities),
          cancellationPolicy: "FREE_CANCEL_48H",
          available: true,
        },
      });
    }

    // Update destination counts
    await db.destination.update({ where: { id: dest.id }, data: { propertyCount: { increment: 1 } } });
  }

  // ============== Cars ==============
  console.log("  → Creating cars & availability...");
  const carData = [
    { brand: "Mercedes-Benz", model: "S-Class", year: 2024, type: "LUXURY", trans: "AUTOMATIC", fuel: "PETROL", seats: 5, doors: 4, daily: 380, weekly: 2280, deposit: 1500, owner: ownerUser1.owner!.id, dest: "Paris", city: "Paris", country: "France", featured: true, img: IMG.cars[0], features: ["leather-seats","sunroof","gps-navigation","premium-sound-system","heated-seats","bluetooth","backup-camera","apple-carplay","keyless-entry","push-button-start","lane-assist","auto-emergency-brake"] },
    { brand: "Porsche", model: "911 Carrera", year: 2024, type: "SPORTS", trans: "AUTOMATIC", fuel: "PETROL", seats: 2, doors: 2, daily: 520, weekly: 3120, deposit: 2500, owner: ownerUser2.owner!.id, dest: "Paris", city: "Los Angeles", country: "USA", featured: true, img: IMG.cars[1], features: ["leather-seats","premium-sound-system","gps-navigation","bluetooth","backup-camera","apple-carplay","heated-seats","keyless-entry","push-button-start"] },
    { brand: "Range Rover", model: "Velar", year: 2024, type: "SUV", trans: "AUTOMATIC", fuel: "DIESEL", seats: 5, doors: 5, daily: 280, weekly: 1680, deposit: 1000, owner: ownerUser3.owner!.id, dest: "Tuscany", city: "London", country: "UK", featured: true, img: IMG.cars[2], features: ["leather-seats","sunroof","gps-navigation","4wd","parking-sensors","bluetooth","backup-camera","apple-carplay","heated-seats","cruise-control","roof-rack","tow-hitch"] },
    { brand: "Tesla", model: "Model S Plaid", year: 2024, type: "ELECTRIC", trans: "AUTOMATIC", fuel: "ELECTRIC", seats: 5, doors: 4, daily: 320, weekly: 1920, deposit: 1200, owner: ownerUser2.owner!.id, dest: "Bali", city: "Los Angeles", country: "USA", featured: true, img: IMG.cars[3], features: ["apple-carplay","android-auto","gps-navigation","backup-camera","auto-emergency-brake","lane-assist","keyless-entry","push-button-start","premium-sound-system","usb-charging"] },
    { brand: "BMW", model: "M4 Competition", year: 2024, type: "SPORTS", trans: "AUTOMATIC", fuel: "PETROL", seats: 4, doors: 2, daily: 410, weekly: 2460, deposit: 1800, owner: ownerUser1.owner!.id, dest: "Santorini", city: "São Paulo", country: "Brazil", featured: false, img: IMG.cars[4], features: ["leather-seats","premium-sound-system","gps-navigation","bluetooth","backup-camera","heated-seats","keyless-entry","push-button-start","cruise-control"] },
    { brand: "Audi", model: "Q7 Quattro", year: 2024, type: "SUV", trans: "AUTOMATIC", fuel: "DIESEL", seats: 7, doors: 5, daily: 240, weekly: 1440, deposit: 900, owner: ownerUser3.owner!.id, dest: "Kyoto", city: "London", country: "UK", featured: false, img: IMG.cars[5], features: ["leather-seats","sunroof","gps-navigation","4wd","parking-sensors","bluetooth","backup-camera","apple-carplay","heated-seats","cruise-control","roof-rack"] },
    { brand: "Ferrari", model: "Roma", year: 2024, type: "LUXURY", trans: "AUTOMATIC", fuel: "PETROL", seats: 4, doors: 2, daily: 890, weekly: 5340, deposit: 5000, owner: ownerUser2.owner!.id, dest: "Maldives", city: "Los Angeles", country: "USA", featured: true, img: IMG.cars[6], features: ["leather-seats","premium-sound-system","gps-navigation","bluetooth","backup-camera","apple-carplay","heated-seats","keyless-entry","push-button-start"] },
    { brand: "Volkswagen", model: "Golf GTI", year: 2024, type: "ECONOMY", trans: "MANUAL", fuel: "PETROL", seats: 5, doors: 5, daily: 95, weekly: 570, deposit: 400, owner: ownerUser1.owner!.id, dest: "Paris", city: "São Paulo", country: "Brazil", featured: false, img: IMG.cars[7], features: ["bluetooth","backup-camera","usb-charging","air-conditioning","cruise-control","keyless-entry"] },
  ];

  for (let i = 0; i < carData.length; i++) {
    const c = carData[i];
    const dest = destRecords.find((d) => d.name === c.dest)!;
    const images = [c.img, ...IMG.cars.filter((x) => x !== c.img).slice(0, 3)];
    const car = await db.car.create({
      data: {
        slug: slugify(`${c.brand}-${c.model}-${c.year}`),
        ownerId: c.owner,
        brand: c.brand,
        model: c.model,
        year: c.year,
        vehicleType: c.type,
        transmission: c.trans,
        fuelType: c.fuel,
        seats: c.seats,
        doors: c.doors,
        mileage: Math.floor(Math.random() * 30000) + 5000,
        features: JSON.stringify(c.features),
        description: `The ${c.year} ${c.brand} ${c.model} is a meticulously maintained ${c.type.toLowerCase()} offering the perfect blend of performance and comfort. Available for rent in ${c.city}, ${c.country}. This vehicle comes fully equipped with premium features and is serviced before every rental. The ${c.brand} ${c.model} is renowned for its reliability, refined interior, and engaging driving dynamics. Pickup and drop-off can be arranged at the airport or any preferred location within the city. Flexible rental terms available.`,
        heroImage: c.img,
        images: JSON.stringify(images),
        locationCity: c.city,
        locationCountry: c.country,
        dailyRate: c.daily,
        weeklyRate: c.weekly,
        monthlyRate: Math.round(c.daily * 26),
        weekendRate: Math.round(c.daily * 1.2),
        securityDeposit: c.deposit,
        minimumRental: 1,
        maximumRental: 30,
        mileagePerDay: 250,
        extraMileageFee: 0.45,
        reviewScore: 4.5 + Math.random() * 0.5,
        reviewCount: Math.floor(Math.random() * 200) + 20,
        rating: 4.5 + Math.random() * 0.5,
        status: "PUBLISHED",
        approved: true,
        featured: c.featured,
        destinationId: dest.id,
      },
    });

    // Generate availability for the next 90 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const availData = [];
    for (let d = 0; d < 90; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() + d);
      // Random ~10% chance of being blocked
      const isBlocked = Math.random() < 0.08;
      availData.push({
        carId: car.id,
        date,
        isAvailable: !isBlocked,
        isBlocked,
      });
    }
    await db.carAvailability.createMany({ data: availData });

    await db.destination.update({ where: { id: dest.id }, data: { carCount: { increment: 1 } } });
  }

  // ============== Bookings ==============
  console.log("  → Creating sample bookings...");
  const allHotels = await db.hotel.findMany({ include: { rooms: true } });
  const allCars = await db.car.findMany();

  // Sample hotel booking
  const hotel = allHotels[0];
  const room = hotel.rooms[0];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 14);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 4);
  const nights = 4;
  const base = room.pricePerNight * nights * 1;
  const fees = base * 0.08;
  const taxes = base * 0.12;
  const total = base + fees + taxes;
  const ref1 = "VY-DEMO1-HOTEL";
  await db.booking.create({
    data: {
      reference: ref1,
      bookingType: "HOTEL",
      customerId: customer1.id,
      hotelId: hotel.id,
      hotelRoomId: room.id,
      startDate,
      endDate,
      nights,
      days: nights,
      guests: 2,
      rooms: 1,
      basePrice: base,
      fees,
      taxes,
      totalAmount: total,
      currency: "USD",
      bookingStatus: "CONFIRMED",
      paymentStatus: "PAID",
      payment: {
        create: {
          provider: "STRIPE",
          providerPaymentId: "pi_demo_hotel_001",
          amount: total,
          currency: "USD",
          status: "SUCCEEDED",
          method: "CARD",
          platformFee: total * 0.12,
        },
      },
    },
  });

  // Sample car booking
  const car = allCars[0];
  const carStart = new Date();
  carStart.setDate(carStart.getDate() + 21);
  const carEnd = new Date(carStart);
  carEnd.setDate(carEnd.getDate() + 3);
  const days = 3;
  const carBase = car.dailyRate * days;
  const carFees = carBase * 0.08;
  const carTaxes = carBase * 0.10;
  const carTotal = carBase + carFees + carTaxes + car.securityDeposit;
  const ref2 = "VY-DEMO2-CAR";
  await db.booking.create({
    data: {
      reference: ref2,
      bookingType: "CAR",
      customerId: customer1.id,
      ownerId: car.ownerId,
      carId: car.id,
      startDate: carStart,
      endDate: carEnd,
      nights: days,
      days,
      guests: 1,
      rooms: 1,
      pickupLocation: "Paris Charles de Gaulle Airport",
      dropoffLocation: "Paris Charles de Gaulle Airport",
      pickupTime: "10:00",
      dropoffTime: "10:00",
      basePrice: carBase,
      fees: carFees,
      taxes: carTaxes,
      totalAmount: carTotal,
      currency: "USD",
      bookingStatus: "CONFIRMED",
      paymentStatus: "PAID",
      payment: {
        create: {
          provider: "STRIPE",
          providerPaymentId: "pi_demo_car_001",
          amount: carTotal,
          currency: "USD",
          status: "SUCCEEDED",
          method: "CARD",
          platformFee: carTotal * 0.12,
          ownerPayout: carTotal * 0.88,
        },
      },
    },
  });

  // Completed booking for reviews
  const pastStart = new Date();
  pastStart.setDate(pastStart.getDate() - 30);
  const pastEnd = new Date(pastStart);
  pastEnd.setDate(pastEnd.getDate() + 5);
  const pastHotel = allHotels[2];
  const pastRoom = pastHotel.rooms[0];
  const pBase = pastRoom.pricePerNight * 5;
  const pFees = pBase * 0.08;
  const pTaxes = pBase * 0.12;
  const pTotal = pBase + pFees + pTaxes;
  const ref3 = "VY-DEMO3-COMPL";
  await db.booking.create({
    data: {
      reference: ref3,
      bookingType: "HOTEL",
      customerId: customer1.id,
      hotelId: pastHotel.id,
      hotelRoomId: pastRoom.id,
      startDate: pastStart,
      endDate: pastEnd,
      nights: 5,
      days: 5,
      guests: 2,
      rooms: 1,
      basePrice: pBase,
      fees: pFees,
      taxes: pTaxes,
      totalAmount: pTotal,
      currency: "USD",
      bookingStatus: "COMPLETED",
      paymentStatus: "PAID",
      payment: {
        create: {
          provider: "STRIPE",
          amount: pTotal,
          currency: "USD",
          status: "SUCCEEDED",
          method: "CARD",
          platformFee: pTotal * 0.12,
        },
      },
    },
  });

  // ============== Reviews ==============
  console.log("  → Creating reviews...");
  const reviews = [
    { title: "Absolutely magical stay", content: "From the moment we arrived, the service was impeccable. The room had breathtaking ocean views and the spa treatments were world-class. Will definitely return.", rating: 5, cleanliness: 5, location: 5, service: 5, value: 4 },
    { title: "A perfect romantic getaway", content: "The villa exceeded all expectations. Private pool, attentive concierge, and the sunset views were unforgettable. Worth every penny.", rating: 5, cleanliness: 5, location: 5, service: 5, value: 5 },
    { title: "Excellent choice for families", content: "Spacious rooms, friendly staff, and lots of activities for kids. The connecting rooms made traveling with teens easy.", rating: 4, cleanliness: 5, location: 4, service: 5, value: 4 },
    { title: "Wonderful boutique experience", content: "Intimate property with personalized service. The location near the historic center was perfect for exploring.", rating: 5, cleanliness: 5, location: 5, service: 5, value: 4 },
    { title: "Pure paradise", content: "The overwater villa was a dream. Crystal-clear water, exceptional dining, and total privacy. Best vacation of our lives.", rating: 5, cleanliness: 5, location: 5, service: 5, value: 5 },
    { title: "Tuscan dream come true", content: "Stayed in a restored villa surrounded by vineyards. The cooking class was a highlight. Highly recommend.", rating: 5, cleanliness: 5, location: 5, service: 4, value: 4 },
  ];
  for (let i = 0; i < reviews.length; i++) {
    const r = reviews[i];
    const hotel = allHotels[i % allHotels.length];
    const reviewer = [customer1, customer2, customer3][i % 3];
    await db.review.create({
      data: {
        reviewerId: reviewer.id,
        hotelId: hotel.id,
        rating: r.rating,
        title: r.title,
        content: r.content,
        cleanliness: r.cleanliness,
        location: r.location,
        service: r.service,
        value: r.value,
      },
    });
  }

  // ============== Promotions ==============
  console.log("  → Creating promotions...");
  await db.promotion.createMany({
    data: [
      {
        title: "Summer Escape — 25% Off Hotels",
        description: "Book any featured hotel for stays before September 30 and save 25%.",
        code: "SUMMER25",
        type: "HOTEL",
        discountPct: 25,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        imageUrl: IMG.hotels[0],
        status: "ACTIVE",
      },
      {
        title: "Weekend Drive — 15% Off Cars",
        description: "Friday to Monday rentals get 15% off any vehicle in our marketplace.",
        code: "WEEKEND15",
        type: "CAR",
        discountPct: 15,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        imageUrl: IMG.cars[1],
        status: "ACTIVE",
      },
      {
        title: "New Member Welcome — $50 Off",
        description: "First-time customers get $50 off bookings over $400.",
        code: "WELCOME50",
        type: "BOTH",
        discountAmt: 50,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        imageUrl: IMG.destinations[0],
        status: "ACTIVE",
      },
    ],
  });

  // ============== Notifications ==============
  console.log("  → Creating notifications...");
  await db.notification.createMany({
    data: [
      { userId: customer1.id, title: "Booking Confirmed", message: `Your hotel booking ${ref1} has been confirmed.`, type: "BOOKING", read: false },
      { userId: customer1.id, title: "Payment Received", message: `We received your payment of $${total.toFixed(2)}.`, type: "PAYMENT", read: true },
      { userId: customer1.id, title: "Welcome to Voyarion", message: "Complete your profile to get personalized recommendations.", type: "SYSTEM", read: true },
      { userId: admin.id, title: "New Owner Registered", message: "Coastal Cars UK joined the platform and is awaiting approval.", type: "SYSTEM", read: false },
      { userId: ownerUser1.id, title: "New Booking Request", message: "You have a new booking request for the Mercedes S-Class.", type: "BOOKING", read: false },
    ],
  });

  // ============== Audit Logs ==============
  console.log("  → Creating audit logs...");
  await db.auditLog.createMany({
    data: [
      { actorId: admin.id, action: "PUBLISHED_HOTEL", entity: "Hotel", entityId: hotelRecords[0].id, metadata: JSON.stringify({ name: hotelRecords[0].name }) },
      { actorId: admin.id, action: "APPROVED_CAR", entity: "Car", entityId: allCars[0].id, metadata: JSON.stringify({ brand: allCars[0].brand, model: allCars[0].model }) },
      { actorId: admin.id, action: "USER_SUSPENDED", entity: "User", entityId: "demo-suspended-user", metadata: JSON.stringify({ reason: "Payment fraud suspicion" }) },
      { actorId: admin.id, action: "PAYOUT_INITIATED", entity: "Payout", metadata: JSON.stringify({ amount: 6240.00 }) },
    ],
  });

  console.log("\n✅ Seed complete!\n");
  console.log("Demo Accounts:");
  console.log("  ─────────────────────────────────────────────");
  console.log("  Admin:    admin@voyarion.com   / admin123");
  console.log("  Customer: guest@voyarion.com  / guest123");
  console.log("  Owner:    owner@voyarion.com  / owner123");
  console.log("  ─────────────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
