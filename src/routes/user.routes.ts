import { Router } from "express";
import { getUsers, loginUser, postUser } from "../controllers/user.controller";
import authenticate from "../middleware/authenticate";

const router = Router();

router.get("/users", authenticate, getUsers);
router.post("/register", postUser);
router.post("/login", loginUser);

export default router;
