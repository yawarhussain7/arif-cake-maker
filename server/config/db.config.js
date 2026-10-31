import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connector = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI);

    console.log("Database connected successfully");
    return connection;
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

export default connector;