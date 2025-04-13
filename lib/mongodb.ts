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
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}


let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect(): Promise<typeof mongoose> {
  console.log("Attempting DB Connect..."); // Log start
  if (cached.conn) {
    console.log("Using cached DB connection."); // Log cache hit
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("Creating new DB connection promise."); // Log promise creation
    const opts = {
      bufferCommands: false, 
      serverSelectionTimeoutMS: 10000 // Timeout after 10 seconds
    };
    console.log(`Attempting mongoose.connect with URI: ${MONGODB_URI}`); // Log URI
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log("DB Connection Successful!"); // Log success
      return mongooseInstance;
    }).catch(err => {
      console.error("DB Connection Error:", err); // Log specific connection error
      cached.promise = null; // Reset promise on error
      throw err; // Re-throw error
    });
  }

  try {
    console.log("Awaiting DB connection promise..."); // Log await start
    cached.conn = await cached.promise;
    console.log("DB connection promise resolved."); // Log await end
  } catch (e) {
     console.error("Failed to establish DB connection during await:", e);
     // Reset promise if await fails
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