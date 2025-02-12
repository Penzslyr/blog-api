import mongoose, { Schema, Document, mongo } from "mongoose";

export interface IPost extends Document {
  user: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  content: string;
  media?: string;
  mediaPublicId?: string;
  likes: number; // Count, not embedded data
  comments: number; // Count, not embedded data
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    post: { type: Schema.Types.ObjectId, ref: "Post", required: false },
    content: { type: String, required: false },
    media: { type: String },
    mediaPublicId: { type: String },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IPost>("Post", PostSchema);
