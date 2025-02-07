import { Router } from "express";
import { getUsers, loginUser, postUser } from "../controllers/user.controller";
import authenticate from "../middleware/authenticate";
import { upload } from "../middleware/upload"; // Import upload middleware

const router = Router();

router.get("/users", authenticate, getUsers);
router.post("/register", upload.single("profilePicture"), postUser); // Upload profile picture
router.post("/login", loginUser);

export default router;
