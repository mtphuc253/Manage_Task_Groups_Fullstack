import { useState, useEffect } from "react"
import DashBoardLayout from "~/components/layouts/DashBoardLayout"
import { API_PATHS } from "~/utils/apiPaths"
import axiosInstance from "~/utils/axiosInstance"
import { Card, CardContent, CardHeader } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Progress } from "~/components/ui/progress"
import { Separator } from "~/components/ui/separator"
import { toast } from "sonner"
import { Download, Loader2, Calendar, Paperclip, Users, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { formatDate, getPriorityBadge, getStatusBadge } from "~/lib/utils"
import { useNavigate } from "react-router-dom"

const ManageTasks = () => {
  const [tasks, setTasks] = useState([])
  const [statusSummary, setStatusSummary] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [activeFilter, setActiveFilter] = useState("all")

  const navigate = useNavigate()

  // Fetch all tasks
  const getAllTasks = async () => {
    setIsLoading(true)
    try {
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS)
      if (response.data && response.data.statusCode === 200) {
        setTasks(response.data.data.tasks)
        setStatusSummary(response.data.data.statusSummary)
      }
    } catch (error) {
      console.error("Error fetching tasks:", error)
      toast.error("Failed to fetch tasks")
    } finally {
      setIsLoading(false)
    }
  }

  // Export tasks
  const exportTasks = async () => {
    setIsExporting(true)
    try {
      const response = await axiosInstance.get(API_PATHS.REPORTS.EXPORT_TASKS, {
        responseType: 'blob'
      })

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `tasks-report-${new Date().toISOString().split('T')[0]}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success("Report downloaded successfully")
    } catch (error) {
      console.error("Error exporting tasks:", error)
      toast.error("Failed to download report")
    } finally {
      setIsExporting(false)
    }
  }

  const handleTaskClick = (taskId) => {
    navigate(`/admin/task-detail?id=${taskId}`)
  }

  useEffect(() => {
    getAllTasks()
  }, [])


  // Filter tasks based on active filter
  const getFilteredTasks = () => {
    if (activeFilter === "all") return tasks
    if (activeFilter === "pending") return tasks.filter(task => task.status === "Pending")
    if (activeFilter === "inProgress") return tasks.filter(task => task.status === "In Progress")
    if (activeFilter === "completed") return tasks.filter(task => task.status === "Completed")
    return tasks
  }

  // Get filter tabs
  const filterTabs = [
    { key: "all", label: "All", count: statusSummary.all || 0, icon: Users },
    { key: "pending", label: "Pending", count: statusSummary.pendingTasks || 0, icon: Clock },
    { key: "inProgress", label: "In Progress", count: statusSummary.inProgressTasks || 0, icon: AlertCircle },
    { key: "completed", label: "Completed", count: statusSummary.completedTasks || 0, icon: CheckCircle2 },
  ]

  const filteredTasks = getFilteredTasks()

  if (isLoading) {
    return (
      <DashBoardLayout>
        <div className="flex h-[400px] w-full items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading tasks...</p>
          </div>
        </div>
      </DashBoardLayout>
    )
  }

  return (
    <DashBoardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
            <p className="text-muted-foreground">Manage and track your tasks</p>
          </div>
          <Button onClick={exportTasks} disabled={isExporting} className="bg-green-600 hover:bg-green-700">
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </>
            )}
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-1 border-b">
          {filterTabs.map((tab) => {
            const Icon = tab.icon
            return (
              <Button
                key={tab.key}
                variant="ghost"
                className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${activeFilter === tab.key
                  ? "border-blue-500 text-blue-600 bg-blue-50"
                  : "border-transparent hover:text-gray-700"
                  }`}
                onClick={() => setActiveFilter(tab.key)}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                <Badge variant="secondary" className="ml-1">
                  {tab.count}
                </Badge>
              </Button>
            )
          })}
        </div>

        {/* Tasks Grid */}
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-gray-100 p-6 mb-4">
              <Users className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-500 max-w-sm">
              {activeFilter === "all"
                ? "You don't have any tasks yet. Create your first task to get started."
                : `No ${activeFilter} tasks found.`
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <Card key={task._id} className="hover:shadow-lg transition-shadow duration-200 cursor-pointer" onClick={() => handleTaskClick(task._id)}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    {getStatusBadge(task.status)}
                    {getPriorityBadge(task.priority)}
                  </div>
                  <h3 className="font-semibold text-lg leading-tight mb-2">{task.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3">{task.description}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Task Done: {task.completedTodoCount || 0} / {task.todoChecklist?.length || 0}</span>
                      <span className="text-muted-foreground">{task.progress || 0}%</span>
                    </div>
                    <Progress value={task.progress || 0} className="h-2" />
                  </div>

                  <Separator />

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Start Date</p>
                      <p className="font-medium">{formatDate(task.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Due Date</p>
                      <p className="font-medium">{formatDate(task.dueDate)}</p>
                    </div>
                  </div>

                  {/* Bottom Section */}
                  <div className="flex items-center justify-between">
                    {/* Assigned Users */}
                    <div className="flex items-center">
                      {task.assignedTo && task.assignedTo.length > 0 ? (
                        <div className="flex -space-x-2">
                          {task.assignedTo.slice(0, 3).map((user) => (
                            <Avatar key={user._id} className="h-8 w-8 border-2 border-white">
                              <AvatarImage src={user.profileImageUrl || "/placeholder.svg"} alt={user.name} className="object-contain" />
                              <AvatarFallback className="text-xs">
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {task.assignedTo.length > 3 && (
                            <div className="h-8 w-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-600">
                                +{task.assignedTo.length - 3}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">No assignees</div>
                      )}
                    </div>

                    {/* Attachments */}
                    {task.attachments && task.attachments.filter(att => att && att.trim()).length > 0 && (
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <Paperclip className="h-4 w-4" />
                        <span className="text-sm">{task.attachments.filter(att => att && att.trim()).length}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashBoardLayout>
  )
}

export default ManageTasks
