import jwt from 'jsonwebtoken'
import User from '../models/user.js'

var verifyUserAuth = async (req, res, next) => {
    try {
        let token = req?.headers?.authorization
        if (token && token.startsWith('Bearer')) {
            token = token.split(' ')[1]
            const { userId = null } = jwt.verify(token, process.env.JWT_SECRET_KEY)
            if (userId) {
                req.user = await User.findById(userId).select("-password")
                console.log("success middleware :", req.user)
                next()
            } else {
                return res.send({ status: "Failed", message: "Unauthorized token" })
            }
        } else {
            return res.send({ status: "Failed", message: "Unauthorized token" })
        }
    } catch (error) {
        console.log(error)
        return res.send({ status: "Failed", message: "Failed" })
    }
}

export { verifyUserAuth }