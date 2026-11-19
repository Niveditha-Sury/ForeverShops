import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/mongodb.js';
import productModel from './models/productModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedFromAssets = async () => {
  try {
    await connectDB();

    const assetsPath = path.join(__dirname, '../Frontend/src/assets/assets.js');
    const content = fs.readFileSync(assetsPath, 'utf8');

    // Extract products array text
    const startIdx = content.indexOf('export const products = [');
    if (startIdx === -1) {
      throw new Error('Could not find products array in assets.js');
    }

    const arrayText = content.slice(startIdx + 'export const products = '.length).trim();
    
    // Replace variable names like p_img1, p_img2_1 with URL strings
    const transformedText = arrayText
      .replace(/_id:\s*"[^"]*",?/g, '') // remove hardcoded string _id so Mongo generates real ObjectId
      .replace(/p_img([0-9_]+)/g, '"http://localhost:4000/images/p_img$1.png"')
      .replace(/subCategory:/g, 'subcategory:'); // normalize subcategory field name

    // Parse transformed array using Function constructor safely
    const parsedProducts = new Function(`return ${transformedText}`)();

    console.log(`Parsed ${parsedProducts.length} products from assets.js`);

    // Clear existing products in Atlas
    const deleteResult = await productModel.deleteMany({});
    console.log(`Removed ${deleteResult.deletedCount} existing items from database.`);

    // Insert all 52 products
    const inserted = await productModel.insertMany(parsedProducts);
    console.log(`Successfully seeded ${inserted.length} real products from assets.js into MongoDB Atlas!`);

    process.exit(0);
  } catch (err) {
    console.error('Error seeding products:', err);
    process.exit(1);
  }
};

seedFromAssets();
