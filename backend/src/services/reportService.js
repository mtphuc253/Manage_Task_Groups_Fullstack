import User from '../models/User.js';
import Task from '../models/Task.js';
import excelJS from 'exceljs';

const exportTasksReport = async () => {
  const tasks = await Task.find().populate('assignedTo', 'name email');
  const workbook = new excelJS.Workbook();
  const worksheet = workbook.addWorksheet('Tasks Report');

  worksheet.columns = [
    { header: 'Task ID', key: '_id', width: 25 },
    { header: 'Title', key: 'title', width: 30 },
    { header: 'Description', key: 'description', width: 50 },
    { header: 'Priority', key: 'priority', width: 15 },
    { header: 'Status', key: 'status', width: 20 },
    { header: 'Due Date', key: 'dueDate', width: 20 },
    { header: 'Assigned To', key: 'assignedTo', width: 30 },
  ];

  tasks.forEach((task) => {
    const assignedTo = task.assignedTo
      .map((user) => `${user.name} (${user.email})`)
      .join(', ');
    worksheet.addRow({
      _id: task._id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate.toISOString().split('T')[0],
      assignedTo: assignedTo || 'Unassigned',
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

const exportUsersReport = async () => {
  const users = await User.find().select('name email _id').lean();
  const userTasks = await Task.find().populate('assignedTo', 'name email _id');

  const userTaskMap = {};
  users.forEach((user) => {
    userTaskMap[user._id] = {
      name: user.name,
      email: user.email,
      taskCount: 0,
      pendingTasks: 0,
      inProgressTasks: 0,
      completedTasks: 0,
    };
  });

  userTasks.forEach((task) => {
    if (task.assignedTo) {
      task.assignedTo.forEach((assignedUser) => {
        const userData = userTaskMap[assignedUser._id];
        if (userData) {
          userData.taskCount += 1;
          if (task.status === 'Pending') userData.pendingTasks += 1;
          else if (task.status === 'In Progress') userData.inProgressTasks += 1;
          else if (task.status === 'Completed') userData.completedTasks += 1;
        }
      });
    }
  });

  const workbook = new excelJS.Workbook();
  const worksheet = workbook.addWorksheet('User Task Report');

  worksheet.columns = [
    { header: 'User Name', key: 'name', width: 30 },
    { header: 'Email', key: 'email', width: 40 },
    { header: 'Total Assigned Tasks', key: 'taskCount', width: 20 },
    { header: 'Pending Tasks', key: 'pendingTasks', width: 20 },
    { header: 'In Progress Tasks', key: 'inProgressTasks', width: 20 },
    { header: 'Completed Tasks', key: 'completedTasks', width: 20 },
  ];

  Object.values(userTaskMap).forEach((user) => {
    worksheet.addRow(user);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

export const reportService = {
  exportTasksReport,
  exportUsersReport,
};
