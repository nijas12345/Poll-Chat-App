import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const databaseConnection = async () => {
  try {
    const mongoUrl = process.env.MONGO_URL;
    if (!mongoUrl) {
      throw new Error("MONGO_URL is not defined in the environment variables.");
    }
    await mongoose.connect(mongoUrl);
    console.log("Mongodb connected");
  } catch (error) {
    console.log("Database is not connected", error);
  }
};

export default databaseConnection;
