import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import userRoutes from "./routes/user.routes";
import mongoose from "mongoose";

dotenv.config();

const app = express();
const mongoBlog: any = process.env.MONGO_URI;

// Connect to MongoDB
mongoose
  .connect(mongoBlog)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Error connecting to MongoDB:", err));

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

app.use(express.urlencoded({ extended: true })); // for x-www-form-urlencoded and form-data. Middleware to parse URL-encoded data and form-data

// Routes
app.use("/api", userRoutes);

export default app;
