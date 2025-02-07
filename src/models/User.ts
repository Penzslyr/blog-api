import mongoose, { Schema, Document } from "mongoose";

// Define interface for user model
interface IUser extends Document {
  email: string;
  username: string;
  displayName?: string;
  birthdate?: Date;
  bio?: string;
  location?: string;
  website?: string;
  password: string;
  profilePicture?: string;
  headerPicture?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define user schema with timestamps
const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
      trim: true,
    },
    birthdate: {
      type: Date,
    },
    bio: {
      type: String,
      default: "",
      trim: true,
    },
    location: {
      type: String,
      default: "",
      trim: true,
    },
    website: {
      type: String,
      default: "",
      trim: true,
    },
    profilePicture: {
      type: String, // Store Cloudinary URL or file path
      default: "",
    },
    headerPicture: {
      type: String, // Store Cloudinary URL or file path
      default: "",
    },
  },
  { timestamps: true } // Automatically adds createdAt & updatedAt fields
);

// Create User model
const User = mongoose.model<IUser>("User", userSchema);

export default User;
