import express, { urlencoded } from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser';
import userRouter from './routes/user.route.js'
import authRouter from './routes/auth.router.js'
import listingRouter from './routes/listing.router.js'
import path from 'path'

const PORT = process.env.PORT || 3000;

dotenv.config()

mongoose.connect(process.env.MONGO)
.then(()=>console.log("MongoDB connected"))
.catch((err)=>console.log(err));

const __dirname = path.resolve()

const app = express()

app.use(express.json());
app.use(cookieParser());   
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? true  // Allow any origin in production (Render will handle security)
        : 'http://localhost:5173',  
    credentials: true
}));

app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/listing', listingRouter);

app.use(express.static(path.join(__dirname,'/client/dist')));


// Remove all catch-all routes and use a simple approach
// The static middleware will handle most routes automatically
// Add this only if needed for specific routes

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
  });


app.use((err,req,res,next)=>{
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error"
    return res.status(statusCode).json({
        success : false,
        statusCode,
        message
    })
})



app.listen(PORT, () => {
    console.log(`Server is running at PORT ${PORT}!!`);
});