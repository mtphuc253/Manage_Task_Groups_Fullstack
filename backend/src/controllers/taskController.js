import { sendSuccess } from '../middlewares/successResponseMiddleware.js'
import { taskService } from '../services/taskService.js';


const getDashboardData = async (req, res, next) => {
  try {
    const result = await taskService.getDashboardData({ user: req.user });
    return sendSuccess(res, result, 'Get dashboard data successfully', 200);
  } catch (error) {
    next(error);
  }
};


const getUserDashboardData = async (req, res, next) => {
  try {
    const result = await taskService.getUserDashboardData({ user: req.user });
    return sendSuccess(res, result, 'Get user dashboard data successfully', 200);
  } catch (error) {
    next(error);
  }
};

const getTasks = async (req, res, next) => {
  try {
    const result = await taskService.getTasks({ user: req.user, query: req.query });
    return sendSuccess(res, result, 'Get tasks successfully', 200);
  } catch (error) {
    next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const result = await taskService.getTaskById({ id: req.params.id, user: req.user });
    return sendSuccess(res, result, 'Get task successfully', 200);
  } catch (error) {
    next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    const result = await taskService.createTask(req.body);
    return sendSuccess(res, result, 'Create task successfully', 201);
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const result = await taskService.updateTask({ id: req.params.id, reqBody: req.body, user: req.user });
    return sendSuccess(res, result, 'Update task successfully', 200);
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const result = await taskService.deleteTask({ id: req.params.id });
    return sendSuccess(res, result, 'Delete task successfully', 200);
  } catch (error) {
    next(error);
  }
};

const updateTaskStatus = async (req, res, next) => {
  try {
    const result = await taskService.updateTaskStatus({ id: req.params.id, reqBody: req.body, user: req.user });
    return sendSuccess(res, result, 'Update task status successfully', 200);
  } catch (error) {
    next(error);
  }
};

const updateTaskCheckList = async (req, res, next) => {
  try {
    const result = await taskService.updateTaskCheckList({ id: req.params.id, reqBody: req.body, user: req.user });
    return sendSuccess(res, result, 'Update task checklist successfully', 200);
  } catch (error) {
    next(error);
  }
};

export const taskController = {
  getDashboardData, getUserDashboardData, getTasks, getTaskById, createTask, updateTask, deleteTask, updateTaskStatus, updateTaskCheckList
}