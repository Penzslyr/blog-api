import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";

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
