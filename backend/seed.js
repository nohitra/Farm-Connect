const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const {
  User,
  FarmerProfile,
  ConsumerProfile,
  Region,
  Hub,
  Produce,
  OrderCycle,
  Order,
  ChatMessage,
  HubAssignmentRequest,
} = require('./models');
const { calculateCurrentWeeklyCycleTimes } = require('./services/cycleScheduler');

const connectDB = require('./config/db');

const seedData = async () => {
  try {
    const conn = await connectDB();
    if (!conn) {
      console.error('❌ Skipping seed process because Database connection failed.');
      process.exit(1);
    }

    console.log('🧹 Clearing existing database collections...');
    await Promise.all([
      User.deleteMany({}),
      FarmerProfile.deleteMany({}),
      ConsumerProfile.deleteMany({}),
      Region.deleteMany({}),
      Hub.deleteMany({}),
      Produce.deleteMany({}),
      OrderCycle.deleteMany({}),
      Order.deleteMany({}),
      ChatMessage.deleteMany({}),
      HubAssignmentRequest.deleteMany({}),
    ]);
    console.log('✅ Collections cleared.');

    // 1. Create Regions
    console.log('🌱 Seeding Regions...');
    const vijayawadaRegion = await Region.create({
      name: 'Vijayawada',
      isActive: true,
    });

    const hyderabadRegion = await Region.create({
      name: 'Hyderabad',
      isActive: true,
    });

    console.log('✅ Regions created: Vijayawada, Hyderabad');

    // 2. Create Hubs for Vijayawada (5 hubs max per spec)
    console.log('🌱 Seeding Hubs...');
    const vijayawadaHubs = await Hub.insertMany([
      {
        name: 'Governorpet / MG Road Hub',
        region: vijayawadaRegion._id,
        anchorAddress: 'Door No. 12-4, Main Road, Governorpet, Vijayawada',
        coordinates: { lat: 16.5103, lng: 80.627 },
        serviceRadiusKm: 4,
        pincodesCovered: ['520002', '520001'],
        contactPersonName: 'Srinivasa Rao',
        contactPhone: '9848012345',
        pickupWindowStart: '18:00',
        pickupWindowEnd: '21:00',
      },
      {
        name: 'Benz Circle / Auto Nagar Hub',
        region: vijayawadaRegion._id,
        anchorAddress: 'Plot 45, Benz Circle Near Executive Club, Vijayawada',
        coordinates: { lat: 16.502, lng: 80.648 },
        serviceRadiusKm: 5,
        pincodesCovered: ['520010', '520007'],
        contactPersonName: 'Venkatesh K',
        contactPhone: '9848054321',
        pickupWindowStart: '18:00',
        pickupWindowEnd: '21:00',
      },
      {
        name: 'Patamata / Bhavanipuram Hub',
        region: vijayawadaRegion._id,
        anchorAddress: 'Bhavani Complex, Patamata High Road, Vijayawada',
        coordinates: { lat: 16.495, lng: 80.655 },
        serviceRadiusKm: 4,
        pincodesCovered: ['520012', '520014'],
        contactPersonName: 'Anil Kumar',
        contactPhone: '9848098765',
        pickupWindowStart: '17:30',
        pickupWindowEnd: '20:30',
      },
      {
        name: 'Gunadala / Ring Road Hub',
        region: vijayawadaRegion._id,
        anchorAddress: 'Kirana Junction, Ring Road, Gunadala, Vijayawada',
        coordinates: { lat: 16.525, lng: 80.665 },
        serviceRadiusKm: 5,
        pincodesCovered: ['520004', '520008'],
        contactPersonName: 'Rajesh Sharma',
        contactPhone: '9848011223',
        pickupWindowStart: '18:00',
        pickupWindowEnd: '21:00',
      },
      {
        name: 'Payakapuram / College Pocket Hub',
        region: vijayawadaRegion._id,
        anchorAddress: 'Community Center, Payakapuram Main St, Vijayawada',
        coordinates: { lat: 16.54, lng: 80.635 },
        serviceRadiusKm: 4,
        pincodesCovered: ['520015', '520011'],
        contactPersonName: 'Nageswara Rao',
        contactPhone: '9848033445',
        pickupWindowStart: '18:00',
        pickupWindowEnd: '21:00',
      },
    ]);

    // Create Hubs for Hyderabad
    const hyderabadHubs = await Hub.insertMany([
      {
        name: 'Gachibowli Hub',
        region: hyderabadRegion._id,
        anchorAddress: 'Financial District Gate 2, Gachibowli, Hyderabad',
        coordinates: { lat: 17.44, lng: 78.348 },
        serviceRadiusKm: 5,
        pincodesCovered: ['500032', '500081'],
        contactPersonName: 'Mahesh Babu',
        contactPhone: '9949012345',
        pickupWindowStart: '18:00',
        pickupWindowEnd: '21:00',
      },
      {
        name: 'Jubilee Hills Hub',
        region: hyderabadRegion._id,
        anchorAddress: 'Road No. 36 Organic Corner, Jubilee Hills, Hyderabad',
        coordinates: { lat: 17.431, lng: 78.407 },
        serviceRadiusKm: 4,
        pincodesCovered: ['500033', '500034'],
        contactPersonName: 'Priya Reddy',
        contactPhone: '9949054321',
        pickupWindowStart: '18:00',
        pickupWindowEnd: '21:00',
      },
    ]);

    console.log(`✅ ${vijayawadaHubs.length + hyderabadHubs.length} Hubs created across regions.`);

    // 3. Create Password Hashes
    const defaultPasswordHash = await bcrypt.hash('Password@123', 10);

    // 4. Create Admin User
    const adminUser = await User.create({
      name: 'FarmConnect Admin',
      email: 'admin@farmconnect.org',
      phone: '9000000000',
      passwordHash: defaultPasswordHash,
      role: 'admin',
      region: vijayawadaRegion._id,
      isVerified: true,
    });

    // 5. Create Farmers & Profiles
    console.log('🌱 Seeding Farmers & Farmer Profiles...');
    const farmerUser1 = await User.create({
      name: 'Ramesh Naidu',
      email: 'ramesh.farmer@farmconnect.org',
      phone: '9849001111',
      passwordHash: defaultPasswordHash,
      role: 'farmer',
      region: vijayawadaRegion._id,
      isVerified: true,
    });

    const farmerProfile1 = await FarmerProfile.create({
      user: farmerUser1._id,
      farmName: 'Green Meadows Organic Farm',
      farmLocation: 'Kankipadu Village, Krishna District',
      farmCoordinates: { lat: 16.42, lng: 80.78 },
      farmingPractice: 'organic',
      certifications: ['NPOP Organic Certified', 'Zero Budget Natural Farming'],
      farmPhotos: [
        'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1592417817098-8f3d6eb147fc?auto=format&fit=crop&w=800&q=80',
      ],
      bio: 'Practicing 100% pesticide-free heirloom vegetable farming for 12 years. Passionate about soil health and nutrient-dense produce.',
      assignedHubs: [vijayawadaHubs[0]._id, vijayawadaHubs[1]._id], // Governorpet & Benz Circle
      verificationStatus: 'approved',
    });

    const farmerUser2 = await User.create({
      name: 'Lakshmi Devi',
      email: 'lakshmi.farmer@farmconnect.org',
      phone: '9849002222',
      passwordHash: defaultPasswordHash,
      role: 'farmer',
      region: vijayawadaRegion._id,
      isVerified: true,
    });

    const farmerProfile2 = await FarmerProfile.create({
      user: farmerUser2._id,
      farmName: 'Sri Lakshmi Natural Farms',
      farmLocation: 'Gannavaram, Krishna District',
      farmCoordinates: { lat: 16.53, lng: 80.8 },
      farmingPractice: 'natural',
      certifications: ['ZBNF Verified'],
      farmPhotos: [
        'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80',
      ],
      bio: 'Family-run natural orchard growing fresh leafy greens, chemical-free tomatoes, and native country eggs.',
      assignedHubs: [vijayawadaHubs[0]._id, vijayawadaHubs[3]._id], // Governorpet & Gunadala
      verificationStatus: 'approved',
    });

    console.log('✅ 2 Farmers & Profiles seeded.');

    // 6. Create Consumer & Profile
    console.log('🌱 Seeding Consumers & Consumer Profiles...');
    const consumerUser1 = await User.create({
      name: 'Ananya Roy',
      email: 'ananya.consumer@gmail.com',
      phone: '9876543210',
      passwordHash: defaultPasswordHash,
      role: 'consumer',
      region: vijayawadaRegion._id,
      isVerified: true,
    });

    const consumerProfile1 = await ConsumerProfile.create({
      user: consumerUser1._id,
      address: 'Flat 402, Sunshine Apartments, Governorpet, Vijayawada',
      pincode: '520002',
      assignedHub: vijayawadaHubs[0]._id, // Governorpet Hub
      savedFarmers: [farmerProfile1._id],
    });

    console.log('✅ Consumer seeded and auto-assigned to Governorpet Hub (520002).');

    // 7. Create Active Order Cycles with Standard Weekly Schedule
    console.log('🌱 Seeding Weekly Recurring Order Cycles (Mon 9:00 AM - Thu 9:00 PM)...');
    const cycleTimes = calculateCurrentWeeklyCycleTimes();

    const createdCycles = [];
    for (const hub of [...vijayawadaHubs, ...hyderabadHubs]) {
      const cycle = await OrderCycle.create({
        region: hub.region,
        hub: hub._id,
        weekStartDate: cycleTimes.weekStartDate,
        weekEndDate: cycleTimes.weekEndDate,
        orderWindowOpen: cycleTimes.orderWindowOpen,
        orderWindowClose: cycleTimes.orderWindowClose,
        deliveryDate: cycleTimes.deliveryDate,
        status: cycleTimes.isWindowOpen ? 'open' : 'closed',
      });
      createdCycles.push(cycle);
    }

    const orderCycle1 = createdCycles[0];
    console.log(`✅ Seeded ${createdCycles.length} automated weekly order cycles across all regional hubs.`);

    // 8. Create Produce Items with Price Breakdown
    console.log('🌱 Seeding Produce Listings with Price Breakdown...');
    const produceItems = await Produce.insertMany([
      {
        farmer: farmerProfile1._id,
        name: 'Country Tomatoes (Desi)',
        category: 'Vegetables',
        unit: 'kg',
        pricePerUnit: 40,
        farmerEarning: 30, // 75% goes directly to farmer
        platformFee: 4,   // 10% platform fee
        deliveryCost: 6,  // 15% hub logistics cost
        quantityAvailable: 150,
        harvestDate: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        images: [
          'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
        ],
        practiceTag: 'Organic',
        isActive: true,
      },
      {
        farmer: farmerProfile1._id,
        name: 'Fresh Spinach (Palak)',
        category: 'Leafy Greens',
        unit: 'bunch',
        pricePerUnit: 25,
        farmerEarning: 19,
        platformFee: 2.5,
        deliveryCost: 3.5,
        quantityAvailable: 80,
        harvestDate: new Date(now.getTime() + 12 * 60 * 60 * 1000),
        images: [
          'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80',
        ],
        practiceTag: 'Organic',
        isActive: true,
      },
      {
        farmer: farmerProfile2._id,
        name: 'Organic Okra (Lady Finger)',
        category: 'Vegetables',
        unit: 'kg',
        pricePerUnit: 50,
        farmerEarning: 38,
        platformFee: 5,
        deliveryCost: 7,
        quantityAvailable: 100,
        harvestDate: new Date(now.getTime() + 36 * 60 * 60 * 1000),
        images: [
          'https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?auto=format&fit=crop&w=600&q=80',
        ],
        practiceTag: 'Natural',
        isActive: true,
      },
    ]);

    console.log(`✅ ${produceItems.length} Produce items seeded.`);

    console.log('🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
    process.exit(1);
  }
};

seedData();
