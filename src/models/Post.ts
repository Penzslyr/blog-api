import mongoose, { Schema, Document } from "mongoose";

export interface IPost extends Document {
  user: mongoose.Types.ObjectId;
  content: string;
  media: string;
  likes: number; // Count, not embedded data
  comments: number; // Count, not embedded data
  createdAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    media: {
      type: String,
      default: "",
    },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IPost>("Post", PostSchema);
