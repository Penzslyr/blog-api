import { Request, Response } from "express";
import Post from "../models/Post";
import Like from "../models/Like";
import Comment from "../models/Comment";

export const createPost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { content } = req.body;
    const userId = (req as any).user; // Extract user from auth middleware

    const post = new Post({ user: userId, content });
    await post.save();

    res.status(201).json({ message: "Post created", post });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllPosts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const posts = await Post.find()
      .populate("user", "email")
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
