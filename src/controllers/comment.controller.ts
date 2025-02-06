import { Request, Response } from "express";
import Post from "../models/Post";
import Like from "../models/Like";
import Comment from "../models/Comment";

interface AuthRequest extends Request {
  user?: string; // or whatever type your `user` is
}

export const addComment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user;
    const { postId } = req.params; // Get postId from URL
    const { content } = req.body;

    if (!postId) {
      res.status(400).json({ message: "Post ID is required" });
      return;
    }

    const comment = new Comment({ user: userId, post: postId, content });
    await comment.save();

    await Post.findByIdAndUpdate(postId, { $inc: { comments: 1 } });

    res.status(201).json({ message: "Comment added", comment });
  } catch (error) {
    res.status(500).json({ message: "Server error", err: error });
  }
};

export const getPostComments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ post: postId })
      .populate("user", "email")
      .sort({ createdAt: -1 });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
