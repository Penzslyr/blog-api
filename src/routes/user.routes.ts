import { Router } from "express";
import { getUsers, postUser } from "../controllers/user.controller";

const router = Router();

router.get("/users", getUsers);
router.post("/register", postUser);

export default router;
