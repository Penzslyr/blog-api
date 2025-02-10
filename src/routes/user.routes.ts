import { Router } from "express";
import {
  getUsers,
  loginUser,
  postUser,
  followUser,
  unfollowUser,
  getUserFollowStats,
} from "../controllers/user.controller";
import authenticate from "../middleware/authenticate";
import uploadRegister from "../middleware/uploadRegister";

const router = Router();

router.get("/users", authenticate, getUsers);
router.post(
  "/register",
  uploadRegister.fields([
    { name: "profilePicture", maxCount: 1 },
    { name: "headerPicture", maxCount: 1 },
  ]),
  postUser
); // Upload profile picture
router.post("/login", loginUser);

// Follow/Unfollow routes (protected by authenticate)
router.post("/:id/follow", authenticate, followUser);
router.post("/:id/unfollow", authenticate, unfollowUser);
router.get("/:id/follow-stats", authenticate, getUserFollowStats);

export default router;
