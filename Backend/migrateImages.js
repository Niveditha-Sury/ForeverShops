import mongoose from "mongoose";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import Product from "./models/productModel.js"; // Adjust path to your product model if needed

dotenv.config();

// 1. Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const migrateProducts = async () => {
  try {
    // 2. Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for migration...");

    // 3. Find all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products to check.`);

    for (let product of products) {
      // Assuming 'image' is an array or string. Let's handle arrays or strings safely:
      let imageUrls = Array.isArray(product.image) ? product.image : [product.image];
      let updatedUrls = [];
      let hasChanged = false;

      for (let imgUrl of imageUrls) {
        // Check if it's a local localhost URL
        if (imgUrl && imgUrl.includes("localhost")) {
          // Extract filename (e.g., "p_img47.png") from "http://localhost:4000/images/p_img47.png"
          const filename = path.basename(imgUrl);
          
          // Path to where your local backend stores uploaded images (adjust 'uploads/' if your folder is named differently)
          const localFilePath = path.join(process.cwd(),"../Frontend", "src", "assets", filename);

          if (fs.existsSync(localFilePath)) {
            console.log(`Uploading ${filename} to Cloudinary...`);
            
            // Upload to Cloudinary
            const uploadResult = await cloudinary.uploader.upload(localFilePath, {
              folder: "forevershops"
            });

            updatedUrls.push(uploadResult.secure_url);
            hasChanged = true;
          } else {
            console.log(`Local file not found for: ${filename}, keeping original.`);
            updatedUrls.push(imgUrl);
          }
        } else {
          // Already a Cloudinary URL or valid link
          updatedUrls.push(imgUrl);
        }
      }

      // If changes were made, update the database document
      if (hasChanged) {
        product.image = Array.isArray(product.image) ? updatedUrls : updatedUrls[0];
        await product.save();
        console.log(`Updated product: ${product.name}`);
      }
    }

    console.log("Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrateProducts();