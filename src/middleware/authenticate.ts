import { Request, Response, NextFunction } from "express";
import jsonwebtoken, { JwtPayload } from "jsonwebtoken";

interface AuthRequest extends Request {
  user?: string;
}

const SECRET_KEY = "blog-secret-key-1";

const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "No token, authorization denied" });
    return; // Ensure function stops execution here
  }

  try {
    const decoded = jsonwebtoken.verify(token, SECRET_KEY) as JwtPayload;
    req.user = decoded._id;
    next(); // Properly calling next()
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
    return; // Ensure function stops execution here
  }
};

export default authenticate;
