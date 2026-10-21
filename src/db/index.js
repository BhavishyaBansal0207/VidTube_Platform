import mongoose from "mongoose";
import dns from "dns";
import { DB_NAME } from "../constants.js";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log(`✅ MongoDB connected DB Host : ${connectionInstance.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection error", error);
    process.exit(1);
  }
};

export { connectDB };