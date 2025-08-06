import express from 'express'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import { taskController } from '../controllers/taskController.js'

const router = express.Router()

router.get('/dashboard-data', authMiddleware.protect, taskController.getDashboardData)
router.get('/user-dashboard-data', authMiddleware.protect, taskController.getUserDashboardData)

router.get('/', authMiddleware.protect, taskController.getTasks) // Get all tasks (Admin: all, User: assigned)
router.get('/:id', authMiddleware.protect, taskController.getTaskById) // Get task by ID

router.post('/', authMiddleware.protect, authMiddleware.adminOnly, taskController.createTask) // Create a task (Admin only)
router.put('/:id', authMiddleware.protect, taskController.updateTask) // Update task details

router.delete('/:id', authMiddleware.protect, authMiddleware.adminOnly, taskController.deleteTask) // Delete a task (Admin only)

router.put('/:id/status', authMiddleware.protect, taskController.updateTaskStatus) // Update task status
router.put('/:id/todo', authMiddleware.protect, taskController.updateTaskCheckList) // Update task checklist


export const taskRoutes = router

