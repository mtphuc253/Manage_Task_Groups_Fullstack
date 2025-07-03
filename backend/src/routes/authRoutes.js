import express from 'express'

import { authController } from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { authValidation } from '../validations/authValidation.js';

const router = express.Router();

router.post("/register", authValidation.register, authController.registerUser);
router.post("/login", authController.loginUser);
router.get("/profile", authMiddleware.protect, authController.getUserProfile);
router.put("/profile", authMiddleware.protect, authController.updateUserProfile);

export const authRoutes = router

