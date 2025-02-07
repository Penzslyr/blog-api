import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary Storage Configuration
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => {
    let folder = "user-uploads"; // Default folder

    if (file.fieldname === "profilePicture") {
      folder = "profile-pictures";
    } else if (file.fieldname === "headerPicture") {
      folder = "header-pictures";
    }

    return {
      folder,
      allowed_formats: ["jpg", "jpeg", "png"],
    };
  },
});

// Multer Middleware for Multiple Uploads
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file limit
});

export default upload;
