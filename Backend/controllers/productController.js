import { v2 as cloudinary } from 'cloudinary';
import productModel from '../models/productModel.js';
import fs from 'fs';

// function for add product
const addProduct = async (req, res) => {
    try {        
      const { name, description, category, price, subcategory, bestseller, sizes } = req.body;

      const image1 = req.files?.image1 && req.files.image1[0];
      const image2 = req.files?.image2 && req.files.image2[0];
      const image3 = req.files?.image3 && req.files.image3[0];
      const image4 = req.files?.image4 && req.files.image4[0];

      const images = [image1, image2, image3, image4].filter((item) => item !== undefined);

      const imagesUrl = await Promise.all(
        images.map(async (item) => {
          try {
            if (process.env.CLOUDINARY_API_KEY && !process.env.CLOUDINARY_API_KEY.includes('your_')) {
              let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
              return result.secure_url;
            }
          } catch (cloudErr) {
            console.log('Cloudinary upload notice:', cloudErr.message);
          }

          // Fallback: Store as Data URL so images display without needing external Cloudinary config
          if (item?.path && fs.existsSync(item.path)) {
            const fileBuffer = fs.readFileSync(item.path);
            const mimeType = item.mimetype || 'image/png';
            return `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
          }
          return '';
        })
      );

      const filteredImagesUrl = imagesUrl.filter((url) => url.length > 0);

      const productData = {
        name,
        description,
        category,
        price: Number(price),
        subcategory,
        bestseller: bestseller === "true" || bestseller === true,
        sizes: typeof sizes === 'string' ? JSON.parse(sizes) : sizes,
        image: filteredImagesUrl,
        date: Date.now()
      };

      const product = new productModel(productData);
      await product.save();

      res.json({ success: true, message: 'Product Added successfully' });
      
    } catch (error) {
      console.log(error);
      res.json({ success: false, message: error.message });
    }
};

// function for List product
const listProducts = async (req, res) => {
  try {
    // .lean() skips Mongoose document hydration 
    const products = await productModel.find({}).sort({ date: -1 }).lean();
    // Let browsers/CDNs reuse the response briefly and serve stale while revalidating
    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    res.json({ success: true, products });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// function for removing product
const removeProduct = async (req, res) => {
   try {
    await productModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: 'Product removed successfully' });
   } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// function for single product info
const singleProduct = async (req, res) => {
  try {  
    const { productId } = req.body;
    const product = await productModel.findById(productId);
    res.json({ success: true, product });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { listProducts, addProduct, removeProduct, singleProduct };
