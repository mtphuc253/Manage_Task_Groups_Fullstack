import User from '../models/User.js'
import Task from '../models/Task.js'
import ApiError from '../utils/ApiError.js'


const getUsers = async () => {
  const users = await User.find({ role: 'member' }).select('-password')

  // Add task counts to each user
  const usersWithTaskCounts = await Promise.all(users.map(async (user) => {
    const pendingTask = await Task.countDocuments({ assignedTo: user._id, status: 'Pending' })
    const inprogressTask = await Task.countDocuments({ assignedTo: user._id, status: 'In Progress' })
    const completedTask = await Task.countDocuments({ assignedTo: user._id, status: 'Completed' })

    return {
      ...user._doc,
      pendingTask,
      inprogressTask,
      completedTask
    }
  }))

  return usersWithTaskCounts
}

const getUserById = async ({ id }) => {
  const user = await User.findById(id).select('-password') // loại bỏ mật khẩu
  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  return {
    user
  }
}

const deleteUser = async ({ id }) => {
  const user = await User.findById(id)

  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  await user.deleteOne() // hoặc User.findByIdAndDelete(id)

  return { message: `User with ID ${id} deleted successfully` }
}

export const userService = {
  getUsers, getUserById, deleteUser
}
