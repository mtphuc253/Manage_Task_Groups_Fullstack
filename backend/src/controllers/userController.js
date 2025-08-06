import { sendSuccess } from '../middlewares/successResponseMiddleware.js'
import { userService } from '../services/userService.js'


const getUsers = async (req, res, next) => {
  try {
    const result = await userService.getUsers()
    return sendSuccess(res, result, 'Get list user successfully', 200)
  } catch (error) {
    next(error)
  }
}

const getUserById = async (req, res, next) => {
  try {
    const result = await userService.getUserById({ id: req.params.id })
    return sendSuccess(res, result, 'Get user imformation successfully', 200)
  } catch (error) {
    next(error)
  }
}

const deleteUser = async (req, res, next) => {
  try {
    const result = await userService.deleteUser({ id: req.params.id })
    return sendSuccess(res, result, 'Delete user successfully', 200)
  } catch (error) {
    next(error)
  }
}

export const userController = {
  getUsers, getUserById, deleteUser
}