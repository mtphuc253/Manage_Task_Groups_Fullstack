import express from 'express'

import { authController } from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { authValidation } from '../validations/authValidation.js';
import ApiError from '../utils/ApiError.js';
import { sendSuccess } from '../middlewares/successResponseMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.post("/register", authValidation.register, authController.registerUser);
router.post("/login", authValidation.login, authController.loginUser);
router.get("/profile", authMiddleware.protect, authController.getUserProfile);
router.put("/profile", authMiddleware.protect, authValidation.updateUserProfile, authController.updateUserProfile);

router.post(
  "/upload-image",
  upload.single("image"),
  authMiddleware.protect,
  authController.uploadImage
)

export const authRoutes = router

