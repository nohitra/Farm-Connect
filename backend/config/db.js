const mongoose = require('mongoose');
const dns = require('dns');

// Ensure reliable DNS resolution for MongoDB Atlas SRV connection strings on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const connectDB = async (retries = 3) => {
  const connStr = process.env.MONGODB_URI;

  if (!connStr) {
    console.error('❌ MONGODB_URI is not defined in backend/.env');
    return null;
  }

  const maskedUri = connStr.replace(/\/\/(.*):(.*)@/, '//***:***@');
  console.log(`📡 Connecting to MongoDB Atlas: ${maskedUri}`);

  while (retries >= 0) {
    try {
      const conn = await mongoose.connect(connStr, {
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 45000,
      });

      console.log(`✅ MongoDB Atlas Connected Successfully!`);
      console.log(`📍 Host: ${conn.connection.host}`);
      console.log(`📦 Database Name: ${conn.connection.name}`);

      mongoose.connection.on('error', (err) => {
        console.error(`⚠️ Mongoose connection error: ${err.message}`);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('⚠️ Mongoose disconnected. Attempting reconnect...');
      });

      return conn;
    } catch (error) {
      if (retries > 0) {
        console.log(`⚠️ Connection retry (${retries} left)... Reason: ${error.message}`);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        retries--;
      } else {
        console.error(`❌ MongoDB Atlas Connection Error: ${error.message}`);
        return null;
      }
    }
  }
};

module.exports = connectDB;
