import { Request, Response } from "express";
import Post from "../models/Post";
import Like from "../models/Like";
import Comment from "../models/Comment";

interface AuthRequest extends Request {
  user?: string;
}

export const likePost = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { postId } = req.params; // Get postId from URL
    const userId = req.user; // Get user ID from auth middleware

    if (!postId) {
      res.status(400).json({ message: "Post ID is required" });
      return;
    }

    // Check if the post exists
    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    // Check if user already liked the post
    const existingLike = await Like.findOne({ user: userId, post: postId });
    if (existingLike) {
      res.status(400).json({ message: "You already liked this post" });
      return;
    }

    // Create new like
    const newLike = new Like({
      user: userId,
      post: postId, // Ensure this field is being set
    });

    await newLike.save();
    post.likes += 1;
    await post.save();

    res.status(201).json({ message: "Post liked successfully", like: newLike });
  } catch (error) {
    res.status(500).json({ message: "Server error", errorMess: error });
  }
};

export const getPostLikes = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { postId } = req.params;
    const likes = await Like.find({ post: postId }).populate("user", "email");
    res.status(200).json(likes);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
