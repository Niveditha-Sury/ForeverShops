import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import userRouter from './routes/userRoute.js'
import productRouter from './routes/productRoute.js'
import cartRouter from './routes/cartRoute.js'
import orderRouter from './routes/orderRoute.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// App Config
const app = express()
const Port = process.env.PORT || 4000
connectDB()
connectCloudinary()

// Middleware
app.use(express.json())
app.use(cors())

// Static folders for product images
app.use('/images', express.static(path.join(__dirname, '../Frontend/src/assets')))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// API Endpoints
app.use('/api/user', userRouter)
app.use('/api/product', productRouter)
app.use('/api/cart', cartRouter)
app.use('/api/order', orderRouter)

app.get('/', (req,res) => {
    res.send('API Working')
})

app.listen(Port,() => console.log('Server is running on port : '+ Port))
