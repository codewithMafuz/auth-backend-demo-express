import User from "../models/user.js";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { checkValidation, generatePassword, isValidEmailAddress, isValidPasswordNormal } from "./helps/validation-help.js";
import { nestedObjectStringsModify } from "./helps/object-help.js";
import { getVerificationLinkTemplate, getVerificationCodeTemplate, sendMail, getEmailConfirmationTemplate } from "../config/emailConfig.js";
import { FRONTEND_BASE_PATH, JWT_SECRET_KEY } from '../app.js'
import PasswordResetRequest from "../models/passwordResetRequest.js";

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
            const { name, email, password, agreeTerms } = req.body
            if (name && email && password) {
                const { errors } = checkValidation({ fullName: name, email: email, password: password })
                if (!errors) {
                    const foundUser = await User.findOne({ email: email })
                    let user = foundUser || {}
                    if (foundUser && foundUser.isEmailVerified) {
                        return res.send(sendTemplate(false, "Already have an account with this email"))
                    }
                    else {
                        if (!foundUser) {
                            const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10))
                            const newUser = new User({
                                name,
                                email,
                                password: hashedPassword,
                                agreeTerms,
                                isEmailVerified: false,
                                sentEmailLinkExpire: 0,
                            })
                            const savedUser = await newUser.save()
                            user = savedUser
                        }

                        const _id = user._id
                        const expiresInMinutes = 30
                        const shouldSentEmail = (!user.sentEmailLinkExpire) || (new Date(user.sentEmailLinkExpire).getTime() < Date.now())
                        if (shouldSentEmail) {
                            const updatedLnkExp = await User.findByIdAndUpdate(_id, {
                                sentEmailLinkExpire: (Date.now() + (expiresInMinutes * 60 * 1000))
                            })
                            if (!updatedLnkExp) {
                                return res.send(sendTemplate(false))
                            }
                            const link = `${FRONTEND_BASE_PATH}/auth/complete-signup/${_id}/@setToken`
                            const { isSuccess } = await UserController.sendEmailConfirmation(
                                email,
                                "MeInfoer - Email Confirmation to Complete Sign up",
                                _id,
                                link,
                                'Complete Sign up',
                                name,
                                `Your email <b>${email}</b> has not been verified yet to create an account on MeInfoer, so please click the link to verify your email`,
                                "MeInfoer",
                                expiresInMinutes
                            )
                            if (isSuccess) {
                                return res.send(sendTemplate(true, `Please check and confirm your email to complete signup within ${expiresInMinutes} minutes`, {
                                    email: email,
                                    confLinkExpInMs: expiresInMinutes * 60 * 1000
                                }))
                            } else {
                                return res.send(sendTemplate(false, "Could not signup, please try again"))
                            }
                        } else {
                            return res.send(sendTemplate(true, `Account already has been created, just confirm your email`, {
                                alreadySent: true,
                                email: email,
                                confLinkExpInMs: user.sentEmailLinkExpire - Date.now()
                            }))
                        }
                    }
                } else {
                    return res.send(sendTemplate(false, `Enter valid ${Object.keys(errors).join(', ')}`))
                }
            } else {
                return res.send(sendTemplate(false, "Fill the required fields"))
            }

        } catch (error) {
            // console.log(error)
            return res.send(sendTemplate(false, "Something went wrong"))
        }
    }

    static sendEmailConfirmation = async (email, subject, _id, link, linkTitle, nameOrUsername, reasonToUseLink, fromBrandName, expiresInMinutes = 30, ifUserDidNot = "If you did not requested for this, please ignore this email", extraHTML = '') => {

        try {
            if (email && isValidEmailAddress(email)) {
                const token = await jwt.sign(
                    { userId: _id },
                    _id + JWT_SECRET_KEY,
                    { expiresIn: expiresInMinutes + 'm' }
                )


                const info = await sendMail(
                    email,
                    subject,
                    getEmailConfirmationTemplate((link.replace('@setToken', token)), linkTitle, nameOrUsername, reasonToUseLink, fromBrandName, ifUserDidNot, extraHTML)
                )
                if (info.accepted.length > 0) {
                    await User.findByIdAndUpdate(_id, {
                        sentEmailLinkExpire: (Date.now() + (expiresInMinutes * 60 * 1000))
                    })
                    return { isSuccess: true }
                } else {
                    return { isSuccess: false }
                }
            } else {
                return { isSuccess: false }
            }
        } catch (error) {
            // console.log(error)
            return res.send(sendTemplate(false, "something went wrong"))
        }
    }

    static verifySignupConfirmation = async (req, res) => {
        try {
            const { id, token } = req.params
            const user = await User.findById(id)
            // console.log(user)
            if (!user.isEmailVerified) {
                const { userId = null } = jwt.verify(token, id + JWT_SECRET_KEY)
                // console.log('userid -----------------', userId)
                if (userId) {
                    await User.findByIdAndUpdate(
                        id,
                        { isEmailVerified: true }
                    )
                    return res.send(sendTemplate(true, "Email successfully verfied and signup completed"))
                } else {
                    return res.send(sendTemplate(false, "could not verify email, please try again"))
                }
            } else {
                return res.send(sendTemplate(false, "Already signup completed, go to login page and login"))
            }
        } catch (error) {
            return res.send(sendTemplate(false, "something went wrong, try again"))
        }
    }

    static login = async (req, res) => {
        try {
            const { email, password } = req.body
            if (email && password) {
                const { errors } = checkValidation({ email: email, password: password })
                if (errors) {
                    return res.send(sendTemplate(false, "invalid email or password"))
                } else {
                    const foundUser = await User.findOne({ email })
                    if (foundUser) {
                        if (!foundUser.isEmailVerified) {
                            return res.send(sendTemplate(false, "email is not verified yet, try signup again to get link again"))
                        }
                        const isMatched = await bcrypt.compare(password, foundUser.password)
                        if (!isMatched) {
                            return res.send(sendTemplate(false, "inavlid email or password"))
                        }
                        const { _id } = foundUser
                        const token = jwt.sign(
                            { userId: _id },
                            JWT_SECRET_KEY,
                            { expiresIn: '7d' }
                        )
                        return res.send(sendTemplate(true, "Successful", { token, _id }))

                    } else {
                        return res.send(sendTemplate(false, "invalid email or password"))
                    }
                }
            } else {
                return res.send(sendTemplate(false, "invalid email or password"))
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
            // console.log("checkuser", checkedUser)
            if (!checkedUser.isEmailVerified) {
                // console.log("checkusers email is not varified", checkedUser)
                return res.send(sendTemplate(false, "Email was not verified, signup again"))
            }
            if (email && checkedUser) {
                // console.log("email and checkeduser here :", checkedUser)
                const isSentAndValid = await PasswordResetRequest.findOne({ userId: checkedUser._id }).select("expiresAt")
                // console.log(isSentAndValid)
                if (isSentAndValid && new Date(isSentAndValid.expiresAt) < Date.now()) {
                    return res.send(sendTemplate(false, "Already sent reset link, please click the link before expire"))
                }
                const secretKey = checkedUser._id + JWT_SECRET_KEY
                const resetId = generatePassword()
                const token = jwt.sign(
                    { userId: checkedUser._id, resetId },
                    secretKey,
                    { expiresIn: '15m' }
                )
                const link = `${FRONTEND_BASE_PATH}/auth/reset-password/${checkedUser._id}/${token}`
                const sent = await sendMail(email,
                    "MeInfoer - Reset Password Link",
                    getVerificationLinkTemplate(link, "Reset Password", checkedUser?.name, "MeInfoer")
                )
                if (sent) {
                    // console.log("sent email")
                    const now = Date.now()
                    const createResetData = new PasswordResetRequest({
                        userId: checkedUser._id,
                        resetId,
                        createdAt: now,
                        expiresAt: now + (15 * 60 * 1000)
                    })
                    await createResetData.save()
                    return res.send(sendTemplate(true, "Sent email, within 15 minutes check the reset password link"))
                } else {
                    return res.send(sendTemplate(false))
                }
            } else {
                return res.send(sendTemplate(false, "Please use correct email"))
            }

        } catch (error) {
            // console.log(error)
            return res.send(sendTemplate(false))
        }
    }

    static resetPassword = async (req, res) => {
        try {
            // console.log(req.body)
            const { id, token } = req.params
            const { password, confirmPassword } = req.body
            if (password !== confirmPassword) {
                return res.send(sendTemplate(false, "Passwords does not matched"))
            }
            if (!id && !token) {
                return res.send(sendTemplate(false, "Sorry, could not reach the page"))
            }

            const { userId = undefined, resetId = undefined } = jwt.verify(token, id + JWT_SECRET_KEY)
            // console.log('coming here', userId)

            if (!userId) {
                return res.send(sendTemplate(false))
            }
            const resetRequest = await PasswordResetRequest.findOneAndDelete({ userId, resetId });
            if (!resetRequest) {
                return res.send(sendTemplate(false, "Already Changed or link may expired or something went wrong"))
            }
            if (checkValidation({ password: password, password: confirmPassword }).errors) {
                return res.send(sendTemplate(false, "Please use a strong new password includes lowercase, uppercase and digits"))
            }
            await User.findByIdAndUpdate(
                userId,
                { password: await bcrypt.hash(password, await bcrypt.genSalt(10)) }, { new: true }).select('-password')
            // console.log("changed of him/her", changedUser)
            return res.send(sendTemplate(true, "Successfully reset password"))


        } catch (error) {
            return res.send(sendTemplate(false, error.message === "jwt expired" ? "Expired" : 'Failed'))
        }
    }

    static deleteUser = async (req, res) => {
        try {
            if (req.user && req.user._id) {
                const { password } = req.body
                if (password && isValidPasswordNormal(password)) {
                    const checkUserPassword = (await User.findById(req.user._id).select("password"))?.password
                    const isMatchedPassword = await bcrypt.compare(password, checkUserPassword)
                    if (!isMatchedPassword) {
                        return res.send(sendTemplate(false, "password is incorrect"))
                    }
                    if (checkUserPassword) {
                        const userId = req.user._id
                        const isDeletedUser = await User.findByIdAndDelete(userId)
                        if (isDeletedUser) {
                            try {
                                await PasswordResetRequest.findOneAndDelete({ userId });
                            } catch (_) { }
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
                return res.send(sendTemplate(false, "Unauthorized user"))
            }
        } catch (error) {
            // console.log(error)
            return res.send(sendTemplate(false))
        }
    }

    static updateUserData = async (req, res) => {
        try {
            const dataToSave = req.body
            const id = dataToSave._id
            delete dataToSave._id
            const isError = checkValidation({ dataToSave }).errors
            // console.log('data to save', dataToSave)
            if (isError) {
                return res.send(sendTemplate(false, `Invalid ${Object.keys(isError).join(', ')}`))
            }
            const updatedData = await User.findByIdAndUpdate(id, { ...dataToSave }, { new: true }).select(Object.keys(dataToSave).join(' '))
            // console.log(updatedData)
            delete updatedData.password
            // console.log(updatedData)
            return res.send(sendTemplate(true, "Successfully updated", updatedData))
        } catch (error) {
            // console.log(error)
            return res.send(sendTemplate(false))
        }
    }

    static compareUserPassword = async (id, userPassword) => {
        try {
            const user = await User.findById(id)
            if (user) {
                const isMatched = await bcrypt.compare(userPassword, user.password)
                return isMatched
            }
            return false
        } catch (error) {
            return false
        }
    }

    static updateUserPassword = async (req, res) => {
        try {
            const { password, newPassword } = req.body
            if (isValidPasswordNormal(password) && isValidPasswordNormal(newPassword)) {

                const { id } = req.user
                const isMatched = await UserController.compareUserPassword(id, password)
                if (isMatched) {
                    const updated = await User.findByIdAndUpdate(id, {
                        password: await bcrypt.hash(newPassword, await bcrypt.genSalt(10))
                    }, { new: true })
                    if (updated) {
                        return res.send(sendTemplate(true, "Successfully updated password"))
                    }
                } else {
                    return res.send(sendTemplate(false, "old password is incorrect"))
                }
                return res.send(sendTemplate(false))
            }
            return res.send(sendTemplate(false))

        } catch (error) {
            return res.send(sendTemplate(false))
        }
    }



}


export default UserController