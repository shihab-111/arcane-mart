import mongoose from 'mongoose';


// Reuse the connection across hot reloads / serverless invocations.
let cached = global._mongoose;
if (!cached) cached = global._mongoose = { conn: null, promise: null };

export default async function dbConnect() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) throw new Error('MONGODB_URI is missing. Copy .env.example to .env and fill it in.');
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
