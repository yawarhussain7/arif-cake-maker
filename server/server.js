import express from 'express'
import dotenv from 'dotenv'
import connector from './config/db.config.js'
import cookieParser from "cookie-parser";
import cors from 'cors'
import path from 'path'
import helmet from 'helmet'
import { fileURLToPath } from 'url'
import { generalLimiter } from './middleware/ratelimiter.middleware.js';


import route from './routes/user.routes.js'
import otpRoute from './routes/otp.routes.js'
import Adminroute from './routes/admin.route.js'
import cakeroute from './routes/cake.route.js'
import orderRoute from './routes/order.route.js'
import categoryRoute from './routes/category.route.js'
import customOrderRoute from './routes/customOrder.route.js'
import notificationRoute from './routes/notification.route.js'



dotenv.config()
const app = express()
//! <<--------------------------------------- middlewares ------------------------------------>>
app.use(cookieParser())
app.use(express.json())
app.use(helmet())
app.use(cors({ origin: true, credentials: true }))
app.use("/api", generalLimiter);

// Cake photos uploaded through multer land in uploads/cakes
const __dirname = path.dirname(fileURLToPath(import.meta.url))
app.use('/uploads', (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
    next()
}, express.static(path.join(__dirname, 'uploads')))

//! <<--------------------------------------- routes ------------------------------------>>
app.use('/auth',route)
app.use('/auth',otpRoute)
app.use('/admin',Adminroute)
app.use('/',cakeroute)
app.use('/',orderRoute)
app.use('/',categoryRoute)
app.use('/',customOrderRoute)
app.use('/',notificationRoute)



const port = process.env.PORT || 9000
connector()

//? <<--------------------------------------- Routes ------------------------------------------->>
app.get('/',(req,res)=>{
    res.status(200).json({
        message:'Testing..',
        success:true
    })
})


//! <<--------------------------------------- error handler ------------------------------------>>
app.use((err, req, res, next) => {
    res.status(err.statusCode || err.status || 500).json({
        success: false,
        message: err.message || 'Something went wrong'
    })
})

app.listen(port, () => console.log(`Server is running on http://localhost:${port}`))