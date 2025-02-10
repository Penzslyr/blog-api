import dotenv from "dotenv";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

dotenv.config();

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// Cloudinary Storage with Correct Types
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "post-picture", // Correct property
    format: async () => "png", // Ensure images are in PNG format
    public_id: (req: any, file: any) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      return `${uniqueSuffix}-${file.originalname.split(".")[0]}`;
    },
  } as {
    folder: string;
    format: () => Promise<string>;
    public_id: (req: Express.Request, file: Express.Multer.File) => string;
  }, // Explicit typing
});

const uploadPost = multer({ storage });

export { uploadPost, cloudinary };
