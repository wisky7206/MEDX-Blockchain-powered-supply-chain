// lib/mongodb.ts
import mongoose from "mongoose";

// Ensure this matches the variable name in your .env.local file
const MONGODB_URI = process.env.MONGODB_URI as string; 

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

// Extend the NodeJS Global type to include mongoose cache
declare global {
  var mongoose: {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
  };
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect(): Promise<mongoose.Connection> {
  console.log("Attempting DB Connect...");
  if (cached.conn) {
    console.log("Using cached DB connection.");
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("Creating new DB connection promise.");
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      retryWrites: true,
      retryReads: true,
      maxPoolSize: 10,
      minPoolSize: 5,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      heartbeatFrequencyMS: 10000,
    };

    console.log(`Attempting mongoose.connect with URI: ${MONGODB_URI}`);
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        console.log("DB Connection Successful!");
        
        // Add connection event listeners
        mongooseInstance.connection.on('error', (err) => {
          console.error('MongoDB connection error:', err);
          cached.promise = null;
          cached.conn = null;
        });

        mongooseInstance.connection.on('disconnected', () => {
          console.log('MongoDB disconnected');
          cached.promise = null;
          cached.conn = null;
        });

        mongooseInstance.connection.on('reconnected', () => {
          console.log('MongoDB reconnected');
        });

        return mongooseInstance.connection;
      })
      .catch(err => {
        console.error("DB Connection Error:", err);
        cached.promise = null;
        throw err;
      });
  }

  try {
    console.log("Awaiting DB connection promise...");
    cached.conn = await cached.promise;
    console.log("DB connection promise resolved.");
  } catch (e) {
    console.error("Failed to establish DB connection during await:", e);
    cached.promise = null;
    cached.conn = null;
    throw e;
  }
  
  if (!cached.conn) {
    throw new Error("MongoDB connection failed silently after await.");
  }
  
  return cached.conn;
}

export default dbConnect;