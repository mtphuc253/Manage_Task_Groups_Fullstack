import express from 'express'
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { userController } from '../controllers/userController.js';

const router = express.Router();

router.get("/", authMiddleware.protect, authMiddleware.adminOnly, userController.getUsers);
router.get("/:id", authMiddleware.protect, userController.getUserById);
router.delete("/:id", authMiddleware.protect, authMiddleware.adminOnly, userController.deleteUser);


export const userRoutes = router

