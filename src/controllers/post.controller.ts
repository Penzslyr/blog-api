import { Request, Response } from "express";
import Post from "../models/Post";
import Like from "../models/Like";
import Comment from "../models/Comment";
import { cloudinary } from "../middleware/uploadPost";

export const retweetPost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const postId = req.params.id;
    const userId = (req as any).user;
    console.log(userId, postId);

    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    // Check if the user has already retweeted this post
    const existingRetweet = await Post.findOne({ user: userId, post: postId });
    if (existingRetweet) {
      // Delete the existing retweet
      await existingRetweet.deleteOne();
      res.status(200).json({ message: "Post unretweeted" });
      console.log("Existing retweet deleted");
      return;
    }

    // Create a new retweet
    const retweet = new Post({
      user: userId,
      post: postId,
    });

    await retweet.save();
    res.status(201).json({ message: "Post retweeted", retweet });
  } catch (error) {
    console.error("Error in retweetPost:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const quotePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user;
    const postId = req.params.id;
    const { content } = req.body;

    let media = "";
    let mediaPublicId = "";

    if (req.file) {
      media = req.file.path;
      // Extract public_id from Cloudinary response
      mediaPublicId = req.file.filename || "";
    }

    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    // Check if the user has already quote this post
    const existingRetweet = await Post.findOne({ user: userId, post: postId });
    if (existingRetweet) {
      res.status(200).json({ message: "You have already quoted this post" });
      console.log("Existing retweet deleted");
      return;
    }

    const quote = new Post({
      user: userId,
      post: postId,
      content,
      media,
      mediaPublicId,
    });

    await quote.save();
    res.status(201).json({ message: "Post quoted", quote });
  } catch (error) {
    console.error("Error in quotePost:", error);
    res.status(500).json({ message: "Server error" });
  }
};

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

export const bookmarkPost = async (
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

    // Check if the post is already bookmarked
    // If it is, remove the user from the bookmarks array
    // If it is not, add the user to the bookmarks array
    if (post.bookmarks.includes(userId)) {
      post.bookmarks = post.bookmarks.filter(
        (id) => id.toString() !== userId.toString()
      );
      await post.save();
      res.status(200).json({ message: "Post unbookmarked", post });
    } else {
      post.bookmarks.push(userId);
      await post.save();
      res.status(200).json({ message: "Post bookmarked", post });
    }
  } catch (error) {
    console.error("Error in bookmarkPost:", error);
    res.status(500).json({ message: "Server error" });
  }
};
