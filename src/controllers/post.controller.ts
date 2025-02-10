import { Request, Response } from "express";
import Post from "../models/Post";
import Like from "../models/Like";
import Comment from "../models/Comment";
import { cloudinary } from "../middleware/uploadPost";

export const createPost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { content } = req.body;
    const userId = (req as any).user;

    let media = "";
    let mediaPublicId = "";

    if (req.file) {
      media = req.file.path;
      // Extract public_id from Cloudinary response
      mediaPublicId = req.file.filename || "";
    }

    const post = new Post({
      user: userId,
      content,
      media,
      mediaPublicId,
    });

    await post.save();

    res.status(201).json({ message: "Post created", post });
  } catch (error) {
    console.error("Error in createPost:", error);
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

/**
 * Deletes a post, its associated likes, comments, and media from Cloudinary
 * @param req Express request object containing post ID and authenticated user
 * @param res Express response object
 */
export const deletePost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const postId = req.params.id;
    const userId = (req as any).user;

    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    if (post.user.toString() !== userId.toString()) {
      res.status(403).json({ message: "Unauthorized to delete this post" });
      return;
    }

    // Delete image from Cloudinary if it exists
    if (post.mediaPublicId) {
      try {
        await cloudinary.uploader.destroy(post.mediaPublicId);
      } catch (cloudinaryError) {
        console.error("Error deleting image from Cloudinary:", cloudinaryError);
      }
    }

    // Delete associated likes and comments
    await Promise.all([
      Like.deleteMany({ post: postId }),
      Comment.deleteMany({ post: postId }),
      post.deleteOne(),
    ]);

    res
      .status(200)
      .json({ message: "Post and associated data deleted successfully" });
  } catch (error) {
    console.error("Error in deletePost:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
