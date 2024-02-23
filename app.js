import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import connectDB from './config/connectDB.js'
import buyerAPIs from './routes/buyerRoutes.js'

// configs
dotenv.config()
connectDB(process.env.DB_CONNECTION_STRING)
const PORT = process.env.PORT

// app, use, middlewares
const app = express()
app.use(cors())
app.use(express.json())
app.use('/api/user', buyerAPIs)

// base routes












app.listen(PORT, () => {
    console.log('app listening at port : ', PORT)
})