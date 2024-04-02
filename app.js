import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import connectDB from './config/connectDB.js'
import userAPIs from './routes/userRoutes.js'

// configs
dotenv.config()
connectDB(process.env.DB_CONNECTION_STRING)
const PORT = process.env.PORT

// app, use, middlewares
const app = express()
app.use(cors())
app.use(express.json())
app.use('/api/user', userAPIs)

// some exports
export const FRONTEND_BASE_PATH = process.env.FRONTEND_BASE_PATH
export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY









app.listen(PORT, () => {
    // console.log('app listening at port : ', PORT)
})