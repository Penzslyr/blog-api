import { Router } from "express";
import authenticate from "../middleware/authenticate";
import { createPost, getAllPosts } from "../controllers/post.controller";
import { getPostLikes, likePost } from "../controllers/like.controller";
import { addComment, getPostComments } from "../controllers/comment.controller";

import { uploadPost, cloudinary } from "../middleware/uploadPost";

const router = Router();

// Posts
router.post("/posts", authenticate, uploadPost.single("media"), createPost);
router.get("/posts", getAllPosts);

// Likes
router.post("/posts/:postId/like", authenticate, likePost);
router.get("/posts/:postId/likes", getPostLikes);

// Comments
router.post("/posts/:postId/comment", authenticate, addComment);
router.get("/posts/:postId/comments", getPostComments);
export default router;
