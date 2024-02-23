import express from 'express'
import UserController from '../controllers/userController.js'
import { verifyUserAuth } from '../middlewares/auth-middleware.js'

const router = express.Router()

// route level middleware
router.use('/loggedin', verifyUserAuth)
router.use('/change-password', verifyUserAuth)
router.use('/delete-user', verifyUserAuth)

// public routes
router.post('/registration', UserController.registration)
router.post('/login', UserController.login)
router.post('/send-reset-password-email', UserController.sendResetPasswordLink)

// protected routes
router.post('/reset-password/:id/:token', UserController.resetPassword)
router.get('/loggedin', UserController.loggedin)
router.post('/change-password', UserController.changePassword)
router.post('/delete-user', UserController.deleteUser)

export default router