import Task from '../models/Task.js'
import ApiError from '../utils/ApiError.js'


const getDashboardData = async ({ user }) => {
  const isAdmin = user.role === 'admin'
  const assignedFilter = isAdmin ? {} : { assignedTo: user._id }

  // Count total tasks
  const totalTasks = await Task.countDocuments(assignedFilter)
  const pendingTasks = await Task.countDocuments({
    status: 'Pending',
    ...assignedFilter
  })
  const completedTasks = await Task.countDocuments({
    status: 'Completed',
    ...assignedFilter
  })
  const overdueTasks = await Task.countDocuments({
    status: { $ne: 'Completed' },
    dueDate: { $lt: new Date() },
    ...assignedFilter
  })

  // Distribution by status
  const taskStatuses = ['Pending', 'In Progress', 'Completed']
  const taskDistributionRaw = await Task.aggregate([
    { $match: assignedFilter },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ])
  const taskDistribution = taskStatuses.reduce((acc, status) => {
    const formattedKey = status.replace(/\s+/g, '')
    acc[formattedKey] =
      taskDistributionRaw.find((item) => item._id === status)?.count || 0
    return acc
  }, {})
  taskDistribution['All'] = totalTasks

  // Distribution by priority
  const taskPriorities = ['Low', 'Medium', 'High']
  const taskPriorityLevelsRaw = await Task.aggregate([
    { $match: assignedFilter },
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 }
      }
    }
  ])
  const taskPriorityLevels = taskPriorities.reduce((acc, priority) => {
    acc[priority] =
      taskPriorityLevelsRaw.find((item) => item._id === priority)?.count || 0
    return acc
  }, {})

  // Get recent 10 tasks
  const recentTasks = await Task.find(assignedFilter)
    .sort({ createdAt: -1 })
    .limit(10)
    .select('title status priority dueDate createdAt')

  return {
    statistics: {
      totalTasks,
      pendingTasks,
      completedTasks,
      overdueTasks
    },
    charts: {
      taskDistribution,
      taskPriorityLevels
    },
    recentTasks
  }
}

const getUserDashboardData = async ({ user }) => {
  const userId = user._id

  // Statistics
  const totalTasks = await Task.countDocuments({ assignedTo: userId })
  const pendingTasks = await Task.countDocuments({ assignedTo: userId, status: 'Pending' })
  const completedTasks = await Task.countDocuments({ assignedTo: userId, status: 'Completed' })
  const overdueTasks = await Task.countDocuments({
    assignedTo: userId,
    status: { $ne: 'Completed' },
    dueDate: { $lt: new Date() }
  })

  // Task distribution by status
  const taskStatuses = ['Pending', 'In Progress', 'Completed']
  const taskDistributionRaw = await Task.aggregate([
    { $match: { assignedTo: userId } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ])

  const taskDistribution = taskStatuses.reduce((acc, status) => {
    const formattedKey = status.replace(/\s+/g, '')
    acc[formattedKey] = taskDistributionRaw.find(item => item._id === status)?.count || 0
    return acc
  }, {})
  taskDistribution['All'] = totalTasks

  // Task distribution by priority
  const taskPriorities = ['Low', 'Medium', 'High']
  const taskPriorityLevelsRaw = await Task.aggregate([
    { $match: { assignedTo: userId } },
    { $group: { _id: '$priority', count: { $sum: 1 } } }
  ])

  const taskPriorityLevels = taskPriorities.reduce((acc, priority) => {
    acc[priority] = taskPriorityLevelsRaw.find(item => item._id === priority)?.count || 0
    return acc
  }, {})

  // Recent tasks
  const recentTasks = await Task.find({ assignedTo: userId })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('title status priority dueDate createdAt')

  return {
    statistics: {
      totalTasks,
      pendingTasks,
      completedTasks,
      overdueTasks
    },
    charts: {
      taskDistribution,
      taskPriorityLevels
    },
    recentTasks
  }
}


const getTasks = async ({ user, query }) => {
  const { status } = query
  let filter = {}

  // Nếu có query status thì lọc theo status
  if (status) {
    filter.status = status
  }

  let tasks

  // Nếu là admin => lấy toàn bộ task
  if (user.role === 'admin') {
    tasks = await Task.find(filter).populate('assignedTo', 'name email profileImageUrl')
  } else {
    // Nếu là member => chỉ lấy task được assign cho họ
    tasks = await Task.find({ ...filter, assignedTo: user._id }).populate('assignedTo', 'name email profileImageUrl')
  }

  // Tính số lượng checklist đã hoàn thành cho từng task
  tasks = await Promise.all(
    tasks.map(async (task) => {
      const completedCount = task.todoChecklist.filter(item => item.completed).length
      return {
        ...task._doc,
        completedTodoCount: completedCount
      }
    })
  )

  // Tính tổng số task theo từng trạng thái (chỉ task được assign nếu không phải admin)
  const commonFilter = user.role === 'admin' ? {} : { assignedTo: user._id }

  const allTasks = await Task.countDocuments(commonFilter)

  const pendingTasks = await Task.countDocuments({
    ...filter,
    status: 'Pending',
    ...(user.role !== 'admin' && { assignedTo: user._id })
  })

  const inProgressTasks = await Task.countDocuments({
    ...filter,
    status: 'In Progress',
    ...(user.role !== 'admin' && { assignedTo: user._id })
  })

  const completedTasks = await Task.countDocuments({
    ...filter,
    status: 'Completed',
    ...(user.role !== 'admin' && { assignedTo: user._id })
  })

  return {
    tasks,
    statusSummary: {
      all: allTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks
    }
  }
}

const getTaskById = async ({ id, user }) => {
  let task
  if (user.role === 'member') {
    task = await Task.findOne({ _id: id, assignedTo: user._id }).populate(
      'assignedTo',
      'name email profileImageUrl'
    )
  } else {
    task = await Task.findById(id).populate(
      'assignedTo',
      'name email profileImageUrl'
    )
  }

  if (!task) {
    throw new ApiError(404, 'Task not found')
  }
  return {
    task
  }
}

const createTask = async ({ title, description, priority, dueDate, assignedTo, attachments, todoChecklist, createdBy }) => {
  // Kiểm tra xem assignedTo có phải là mảng không
  if (!Array.isArray(assignedTo)) {
    throw new ApiError(400, 'assignedTo must be an array of user IDs')
  }

  // Tạo task mới
  const task = await Task.create({
    title,
    description,
    priority,
    dueDate,
    assignedTo,
    attachments,
    todoChecklist,
    createdBy
  })

  return task.populate(
    'assignedTo',
    'name email profileImageUrl'
  )
}
const updateTask = async ({ id, reqBody, user }) => {
  let task
  if (user.role === 'member') {
    task = await Task.findOne({ _id: id, assignedTo: user._id })
  } else {
    task = await Task.findById(id)
  }

  if (!task) {
    throw new ApiError(404, 'Task not found')
  }

  task.title = reqBody.title || task.title
  task.description = reqBody.description || task.description
  task.priority = reqBody.priority || task.priority
  task.dueDate = reqBody.dueDate || task.dueDate
  task.attachments = reqBody.attachments || task.attachments

  // Nếu có cập nhật todoChecklist thì cập nhật và tính lại progress, status
  if (reqBody.todoChecklist) {
    task.todoChecklist = reqBody.todoChecklist

    const completedCount = task.todoChecklist.filter(item => item.completed).length
    const totalItemsInTodo = task.todoChecklist.length
    const taskProgress = totalItemsInTodo > 0 ? Math.round((completedCount / totalItemsInTodo) * 100) : 0
    task.progress = taskProgress

    if (taskProgress === 100) {
      task.status = 'Completed'
    } else if (taskProgress > 0) {
      task.status = 'In Progress'
    } else {
      task.status = 'Pending'
    }
  }

  if (reqBody.assignedTo) {
    if (!Array.isArray(reqBody.assignedTo)) {
      throw new ApiError(400, 'assignedTo must be an array of user IDs')
    }
    task.assignedTo = reqBody.assignedTo || task.assignedTo
  }

  const updatedTask = await task.save()
  return updatedTask.populate(
    'assignedTo',
    'name email profileImageUrl'
  )
}

const deleteTask = async ({ id }) => {
  const task = await Task.findById(id)

  if (!task) {
    throw new ApiError(404, 'User not found')
  }

  await task.deleteOne() // hoặc Task.findByIdAndDelete(id)

  return { message: `Tak with ID ${id} deleted successfully` }
}

const updateTaskStatus = async ({ id, reqBody, user }) => {
  let task
  if (user.role === 'member') {
    task = await Task.findOne({ _id: id, assignedTo: user._id })
  } else {
    task = await Task.findById(id)
  }

  if (!task) {
    throw new ApiError(404, 'Task not found')
  }

  task.status = reqBody.status || task.status

  if (task.status === 'Completed') {
    task.todoChecklist.forEach((item) => (item.completed = true))
    task.progress = 100
  }

  const updatedTask = await task.save()

  return updatedTask.populate(
    'assignedTo',
    'name email profileImageUrl'
  )
}

const updateTaskCheckList = async ({ id, reqBody, user }) => {
  const { todoChecklist } = reqBody
  let task
  if (user.role === 'member') {
    task = await Task.findOne({ _id: id, assignedTo: user._id })
  } else {
    task = await Task.findById(id)
  }

  if (!task) {
    throw new ApiError(404, 'Task not found')
  }

  task.todoChecklist = todoChecklist

  const completedCount = task.todoChecklist.filter((item) => item.completed).length
  const totalItemsInTodo = task.todoChecklist.length

  const taskProgress = totalItemsInTodo > 0 ? Math.round((completedCount / totalItemsInTodo) * 100) : 0
  task.progress = taskProgress

  if (taskProgress === 100) {
    task.status = 'Completed'
  } else if (taskProgress > 0) {
    task.status = 'In Progress'
  } else {
    task.status = 'Pending'
  }

  const updatedTask = await task.save()

  return updatedTask.populate(
    'assignedTo',
    'name email profileImageUrl'
  )
}

export const taskService = {
  getDashboardData, getUserDashboardData, getTasks, getTaskById, createTask, updateTask, deleteTask, updateTaskStatus, updateTaskCheckList
}
