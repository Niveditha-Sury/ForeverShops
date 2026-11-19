import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Set up Cloudinary storage engine
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "forevershops", // Folder name inside your Cloudinary Media Library
    allowed_formats: ["jpg", "png", "jpeg", "webp"]
  }
});

const upload = multer({ storage });

export default upload;