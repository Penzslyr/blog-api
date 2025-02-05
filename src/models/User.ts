import { Timestamp } from "./../../node_modules/bson/src/timestamp";
import mongoose, { Schema, Document } from "mongoose";

// define interface for user model
interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

// define use schema with timestamps on
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
  },
  { timestamps: true } // auto add createdAt and updateAt
);

//
const User = mongoose.model<IUser>("User", userSchema);

export default User;
