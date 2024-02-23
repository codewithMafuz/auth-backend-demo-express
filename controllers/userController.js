import User from "../models/user.js";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { checkValidation, isValidPasswordNormal } from "./helps/validation-help.js";
import { nestedObjectStringsModify } from "./helps/object-help.js";
import { resetPasswordLinkBody, sendMail } from "../config/emailConfig.js";


const sendTemplate = (isSuccess, message = null, data = null) => {
    return {
        status: isSuccess ? "OK" : "Failed",
        message: message ? message : isSuccess ? "Successful" : "Failed",
        data
    }
}

class UserController {
    static registration = async (req, res) => {
        try {
            nestedObjectStringsModify(req.body)
            const { name, email, password, recieveEmails, phone } = req.body
            if (name && email && password) {
                const { errors } = checkValidation({ fullName: name, email: email, password: password })
                if (!errors) {
                    const foundUser = await User.findOne({ email: email })
                    if (foundUser) {
                        return res.send(sendTemplate(false, "Email already exist", email))
                    } else {
                        const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10))
                        const newUser = new User({
                            name,
                            email,
                            password: hashedPassword,
                            phone,
                            recieveEmails,
                        })
                        const { _id } = await newUser.save()
                        const token = jwt.sign(
                            { userId: _id },
                            process.env.JWT_SECRET_KEY,
                            { expiresIn: '3d' }
                        )
                        return res.send(sendTemplate(true, "Successfully registered", { token, _id }))
                    }
                } else {
                    return res.send(sendTemplate(false, `Enter valid ${Object.keys(errors).join(', ')}`))
                }
            } else {
                return res.send(sendTemplate(false, "Fill the required fields"))
            }

        } catch (error) {
            console.log("error : ", error)
            return res.send(sendTemplate(false, "Something went wrong"))
        }
    }

    static login = async (req, res) => {
        try {
            nestedObjectStringsModify(req.body)
            const { email, password, rememberMe } = req.body
            if (email && password) {
                const { errors } = checkValidation({ email: email, password: password })
                if (errors) {
                    return res.send(sendTemplate(false, "wrong email or password"))
                } else {
                    const foundUser = await User.findOne({ email })
                    if (foundUser) {
                        const isMatched = await bcrypt.compare(password, foundUser.password)
                        if (isMatched) {
                            const { _id } = foundUser
                            const token = jwt.sign(
                                { userId: _id },
                                process.env.JWT_SECRET_KEY,
                                { expiresIn: '3d' }
                            )
                            return res.send(sendTemplate(true, "Successful", { token, _id }))
                        } else {
                            return res.send(sendTemplate(false, "wrong email or password"))
                        }
                    } else {
                        return res.send(sendTemplate(false, "wrong email or password"))
                    }
                }
            } else {
                return res.send(sendTemplate(false, "wrong email or password"))
            }
        } catch (error) {
            return res.send(sendTemplate(false, "something went wrong"))
        }

    }

    static loggedin = async (req, res) => {
        try {
            if (req.user) {
                return res.send(sendTemplate(true, "Success", { user: req.user }))
            }
            return res.send(sendTemplate(false))
        } catch (error) {
            return res.send(sendTemplate(false))
        }
    }

    static sendResetPasswordLink = async (req, res) => {
        try {
            const email = req.body.email.trim()
            const checkedUser = await User.findOne({ email }).select('-password')
            if (email && checkedUser) {
                const secretKey = checkedUser._id + process.env.JWT_SECRET_KEY
                const token = jwt.sign(
                    { userId: checkedUser._id },
                    secretKey,
                    { expiresIn: '3m' }
                )
                const link = `${process.env.FRONTEND_BASE_PATH}/auth/reset-password/${checkedUser._id}/${token}`
                const info = await sendMail(email,
                    "codewithMafuz - Password Reset Link",
                    resetPasswordLinkBody(link, checkedUser?.name)
                )
                console.log('info:', info)
                return res.send(sendTemplate(true, "Sent email, check the reset password link within 3 minutes"))
            } else {
                return res.send(sendTemplate(false, "Please use correct email"))
            }

        } catch (error) {
            console.log(error)
            return res.send(sendTemplate(false, "failed"))
        }
    }

    static resetPassword = async (req, res) => {
        try {
            nestedObjectStringsModify(req.body)
            const { id, token } = req.params
            console.log(id, token)
            if (!id && !token) return res.send(sendTemplate(false, "sorry, could not reach the page"))

            const { userId = null } = jwt.verify(token, id + process.env.JWT_SECRET_KEY)
            if (userId) {
                const { password, confirmPassword } = req.body
                if (password !== confirmPassword) {
                    return res.send(sendTemplate(false, "Passwords does not matched"))
                } else if (checkValidation({ password: password, password: confirmPassword }).errors) {
                    return res.send(sendTemplate(false, "Please use a strong new password includes lowercase, uppercase and digits"))
                } else {
                    const changedUser = await User.findByIdAndUpdate(
                        userId,
                        { password: await bcrypt.hash(password, await bcrypt.genSalt(10)) }, { new: true }).select('-password')
                    console.log("changed of him/her", changedUser)
                    return res.send(sendTemplate(true, "Successfully reset password"))

                }
            }
        } catch (error) {
            return res.send(sendTemplate(false, "failed"))
        }
    }

    static changePassword = async (req, res) => {
        try {
            if (req.user) {
                nestedObjectStringsModify(req.body)
                const { password, confirmPassword } = req.body
                if (password !== confirmPassword) {
                    return res.send(sendTemplate(false, "Passwords does not matched"))
                } else if (checkValidation({ password: password, password: confirmPassword }).errors) {
                    return res.send(sendTemplate(false, "Please use a strong new password includes lowercase, uppercase and digits"))
                } else {
                    const user = await User.findByIdAndUpdate(
                        req.user._id,
                        { password: await bcrypt.hash(password, await bcrypt.genSalt(10)) },
                        { new: true }
                    ).select("-password")
                    return res.send(sendTemplate(true, "Successfully Changed Password", { user }))

                }
            } else {
                return res.send(sendTemplate(false, "Unauthorized token"))
            }
        } catch (error) {
            return res.send(sendTemplate(false, "failed to change password"))
        }
    }

    static deleteUser = async (req, res) => {
        try {
            if (req.user && req.user._id) {
                nestedObjectStringsModify(req.body)
                const { password } = req.body
                if (password && isValidPasswordNormal(password)) {
                    const checkUserPassword = (await User.findById(req.user._id).select("password"))?.password
                    if (checkUserPassword && (await bcrypt.compare(password, checkUserPassword))) {
                        const isDeletedUser = await User.findByIdAndDelete(req.user._id)
                        if (isDeletedUser) {
                            return res.send(sendTemplate(true, "Successfully deleted user"))
                        } else {
                            return res.send(sendTemplate(false, "Failed to delete user"))
                        }
                    } else {
                        return res.send(sendTemplate(false, "Failed to delete user"))
                    }

                } else {
                    return res.send(sendTemplate(false, "Wrong password"))
                }
            } else {
                return res.send(sendTemplate(false, "Unauthorized token"))
            }
        } catch (error) {
            console.log(error)
            return res.send(sendTemplate(false, "failed"))
        }
    }
}


export default UserController