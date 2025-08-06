import express from 'express'
import { authController } from '~/controllers/authController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { upload } from '~/middlewares/uploadMiddleware'
import { authValidation } from '~/validations/authValidation'

const router = express.Router()

router.post('/register', authValidation.register, authController.registerUser)
router.post('/login', authValidation.login, authController.loginUser)
router.get('/profile', authMiddleware.protect, authController.getUserProfile)
router.put('/profile', authMiddleware.protect, authValidation.updateUserProfile, authController.updateUserProfile)
router.post('/upload-image', upload.single('image'), authController.uploadImage)

export const authRoutes = router

