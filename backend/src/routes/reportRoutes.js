import express from 'express'
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { reportController } from '../controllers/reportController.js';

const router = express.Router();

router.get("/export/tasks", authMiddleware.protect, authMiddleware.adminOnly, reportController.exportTasksReport);
router.get("/export/users", authMiddleware.protect, authMiddleware.adminOnly, reportController.exportUsersReport);



export const reportRoutes = router

