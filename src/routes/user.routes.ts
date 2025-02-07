import { Router } from "express";
import { getUsers, loginUser, postUser } from "../controllers/user.controller";
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

export default router;
