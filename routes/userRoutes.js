import express from 'express'
import UserController from '../controllers/userController.js'
import { verifyUserAuth } from '../middlewares/auth-middleware.js'

const router = express.Router()

// route level middleware
router.use('/loggedin', verifyUserAuth)
router.use('/delete-user', verifyUserAuth)
router.use('/update-data', verifyUserAuth)
router.use('/update-password', verifyUserAuth)
router.post('/delete-user', UserController.deleteUser)

// public routes
router.post('/registration', UserController.registration)
router.post('/login', UserController.login)
router.post('/send-reset-password-email', UserController.sendResetPasswordLink)

// protected routes
router.post('/reset-password/:id/:token', UserController.resetPassword)
router.get('/loggedin', UserController.loggedin)
router.post('/delete-user', UserController.deleteUser)
router.get('/complete-signup/:id/:token', UserController.verifySignupConfirmation)
router.post('/update-data', UserController.updateUserData)
router.post('/update-password', UserController.updateUserPassword)

export default router