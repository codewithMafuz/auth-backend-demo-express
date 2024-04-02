import jwt from 'jsonwebtoken'
import User from '../models/user.js'
import { JWT_SECRET_KEY } from '../app.js'

var verifyUserAuth = async (req, res, next) => {
    try {
        let token = req?.headers?.authorization
        // console.log('token :', token)
        if (token && token.startsWith('Bearer')) {
            token = token.split(' ')[1]
            // console.log('token step 2 :', token)
            const { userId = null } = jwt.verify(token, JWT_SECRET_KEY)
            // console.log('token id:', userId)
            if (userId) {
                req.user = await User.findById(userId).select("-password")
                // console.log("success middleware :", req.user)
                next()
            } else {
                return res.send({ success: false, status: "Failed", message: "Unauthorized token" })
            }
        } else {
            return res.send({ success: false, status: "Failed", message: "Unauthorized token" })
        }
    } catch (error) {
        // console.log('error in middleware', error)
        return res.send({ success: false, status: "Failed", message: error?.name === "JsonWebTokenError" ? "session token expired or not available" : "something error happened" })
    }
}

export { verifyUserAuth }