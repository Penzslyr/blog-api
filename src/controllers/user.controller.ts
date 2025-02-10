import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import mongoose from "mongoose";

// Define interface for authenticated requests
interface AuthRequest extends Request {
  user?: string;
}

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({});
    res.status(200).json({
      // Use 200 for successful GET requests
      message: "User data retrieved successfully!",
      data: users,
    });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ message: "Error retrieving user data" }); // Send an error response
  }
};

export const postUser = async (req: Request, res: Response): Promise<void> => {
  const {
    username,
    email,
    password,
    displayName,
    birthdate,
    bio,
    location,
    website,
  } = req.body;

  // Explicitly cast req.files as an object containing arrays of files
  const files = req.files as
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;

  const profilePicture = files?.["profilePicture"]?.[0]?.path || "";
  const headerPicture = files?.["headerPicture"]?.[0]?.path || "";

  if (!username || !email || !password) {
    res
      .status(400)
      .json({ message: "Username, email, and password are required" });
    return;
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      displayName: displayName || username,
      birthdate: birthdate || null,
      bio: bio || "",
      location: location || "",
      website: website || "",
      profilePicture, // Save uploaded profile picture URL
      headerPicture,
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully!",
      user: {
        username: newUser.username,
        email: newUser.email,
        displayName: newUser.displayName,
        birthdate: newUser.birthdate,
        bio: newUser.bio,
        location: newUser.location,
        website: newUser.website,
        profilePicture: newUser.profilePicture,
        headerPicture: newUser.headerPicture,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const existingUser = await User.findOne({ email });

  if (!existingUser) {
    res.status(401).json({ message: "User not exists" });
    return;
  }
  const matchPassword = await bcrypt.compare(password, existingUser.password);
  if (!matchPassword) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }
  const token = jsonwebtoken.sign(
    { _id: existingUser._id },
    "blog-secret-key-1",
    { expiresIn: "1h" }
  );
  res.status(200).json({
    message: "Login successfully",
    user: {
      _id: existingUser._id,
      email: existingUser.email,
      username: existingUser.username,
    },
    data: token,
  });
};

export const followUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user); // req.user is the ID string

    if (!userToFollow || !currentUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Check if already following
    if (
      currentUser.following.includes(
        userToFollow._id as unknown as mongoose.Types.ObjectId
      )
    ) {
      res.status(400).json({ message: "Already following this user" });
      return;
    }

    // Add to following/followers
    await User.findByIdAndUpdate(currentUser._id, {
      $push: { following: userToFollow._id },
    });

    await User.findByIdAndUpdate(userToFollow._id, {
      $push: { followers: currentUser._id },
    });

    res.status(200).json({
      message: "Successfully followed user",
      followedUser: userToFollow.username,
    });
  } catch (error) {
    console.error("Error following user:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const unfollowUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user); // req.user is the ID string

    if (!userToUnfollow || !currentUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Check if not following
    if (
      !currentUser.following.includes(
        userToUnfollow._id as unknown as mongoose.Types.ObjectId
      )
    ) {
      res.status(400).json({ message: "Not following this user" });
      return;
    }

    // Remove from following/followers
    await User.findByIdAndUpdate(currentUser._id, {
      $pull: { following: userToUnfollow._id },
    });

    await User.findByIdAndUpdate(userToUnfollow._id, {
      $pull: { followers: currentUser._id },
    });

    res.status(200).json({
      message: "Successfully unfollowed user",
      unfollowedUser: userToUnfollow.username,
    });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Helper function to get followers/following count and list
export const getUserFollowStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.params.id)
      .populate("followers", "username displayName profilePicture")
      .populate("following", "username displayName profilePicture");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      followers: {
        count: user.followers.length,
        list: user.followers,
      },
      following: {
        count: user.following.length,
        list: user.following,
      },
    });
  } catch (error) {
    console.error("Error getting follow stats:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
