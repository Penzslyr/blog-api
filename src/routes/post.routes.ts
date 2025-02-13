import { Router } from "express";
import authenticate from "../middleware/authenticate";
import {
  createPost,
  getAllPosts,
  deletePost,
  retweetPost,
  quotePost,
  bookmarkPost,
  getBookmarkedPosts,
} from "../controllers/post.controller";
import { getPostLikes, likePost } from "../controllers/like.controller";
import { addComment, getPostComments } from "../controllers/comment.controller";

import { uploadPost, cloudinary } from "../middleware/uploadPost";

const router = Router();

// Posts
router.post("/posts", authenticate, uploadPost.single("media"), createPost);
router.post("/posts/:id/retweet", authenticate, retweetPost);
router.post(
  "/posts/:id/quote",
  authenticate,
  uploadPost.single("media"),
  quotePost
);
router.post("/posts/:id/bookmark", authenticate, bookmarkPost);
router.get("/posts", getAllPosts);
router.get("/posts/bookmarked", authenticate, getBookmarkedPosts);
router.delete("/posts/:id", authenticate, deletePost);

// Likes
router.post("/posts/:postId/like", authenticate, likePost);
router.get("/posts/:postId/likes", getPostLikes);

// Comments
router.post("/posts/:postId/comment", authenticate, addComment);
router.get("/posts/:postId/comments", getPostComments);
export default router;
