import { env } from '../config/environment.js'
import jwt from 'jsonwebtoken'

import { authService } from '../services/authService.js'
import { sendSuccess } from '../middlewares/successResponseMiddleware.js'

const registerUser = async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body);
    return sendSuccess(res, result, 'Register successfully', 201);
  } catch (error) {
    next(error)
  }
}

const loginUser = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    return sendSuccess(res, result, 'Login successfully', 200);
  } catch (error) {
    next(error)
  }
}

const getUserProfile = async (req, res, next) => {
  try {
    const result = await authService.getUserProfile({ user: req.user });
    return sendSuccess(res, result, 'Get user profile successfully', 200);
  } catch (error) {
    next(error);
  }
};

const updateUserProfile = async (req, res, next) => {
  try {
    const result = await authService.updateUserProfile({ user: req.user, body: req.body });
    return sendSuccess(res, result, 'Update user profile successfully', 200);
  } catch (error) {
    next(error);
  }
}

const uploadImage = async (req, res, next) => {
  try {
    const result = await authService.uploadImage(req)
    return sendSuccess(res, result, "Upload successfully", 200)
  } catch (error) {
    next(error)
  }
}

export const authController = {
  registerUser, loginUser, getUserProfile, updateUserProfile, uploadImage
}