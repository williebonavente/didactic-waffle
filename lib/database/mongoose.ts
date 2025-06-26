import mongoose, { Mongoose } from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL;

interface MongooseConnection {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
}
declare global {
    var mongoose: MongooseConnection | undefined;
}
let cached: MongooseConnection = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = {
        conn: null, promise: null
    }
}

export const connectToDatabase = async () => {
    if (cached.conn) return cached.conn;

    if (!MONGODB_URL) throw new Error('Missing MONGODB_URL');
     console.log("Connecting to MongoDB..."); 
    cached.promise = cached.promise || mongoose.connect
    (MONGODB_URL, { dbName: 'imaginify', bufferCommands: false})

    cached.conn = await cached.promise;
    console.log("Connected!");

    return cached.conn;
}