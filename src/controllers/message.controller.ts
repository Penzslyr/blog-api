import { Request, Response } from "express";
import Message from "../models/Message";

interface AuthRequest extends Request {
  user?: string;
}

// Create a new message
export const createMessage = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const sender = (req as any).user;
    const { receiver, content } = req.body;

    console.log(receiver, content, sender);

    if (!receiver || !content) {
      res.status(400).json({ message: "Receiver and content are required" });
      return;
    }

    const message = new Message({
      sender,
      receiver,
      content,
    });

    await message.save();

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: "Error creating message" });
  }
};

// Get all messages between the logged in user and the user with the given ID
export const getMessages = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const loggedInUser = (req as any).user;

    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    const messages = await Message.find({
      $or: [
        { sender: loggedInUser, receiver: userId },
        { sender: userId, receiver: loggedInUser },
      ],
    }).sort({ createdAt: 1 }); // Sort messages by creation date

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error getting messages" });
  }
};
