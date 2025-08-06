import { reportService } from '../services/reportService.js'

const exportTasksReport = async (req, res, next) => {
  try {
    const buffer = await reportService.exportTasksReport()
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    res.setHeader('Content-Disposition', 'attachment filename="tasks_report.xlsx"')
    return res.send(buffer)
  } catch (error) {
    next(error)
  }
}

const exportUsersReport = async (req, res, next) => {
  try {
    const buffer = await reportService.exportUsersReport()
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    res.setHeader('Content-Disposition', 'attachment filename="users_report.xlsx"')
    return res.send(buffer)
  } catch (error) {
    next(error)
  }
}

export const reportController = {
  exportTasksReport,
  exportUsersReport
}
