"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { useLocation, useNavigate } from "react-router-dom"
import DashBoardLayout from "~/components/layouts/DashBoardLayout"
import { API_PATHS } from "~/utils/apiPaths"
import axiosInstance from "~/utils/axiosInstance"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { Label } from "~/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Checkbox } from "~/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Badge } from "~/components/ui/badge"
import { Progress } from "~/components/ui/progress"
import { toast } from "sonner"
import { Plus, Trash2, Link, CheckSquare, Loader2, X, UserPlus, Paperclip, ArrowLeft, RotateCcw, Edit3, Eye, Save, RefreshCw } from 'lucide-react'
import { getPriorityColor, getRoleBadge, formatDate, getPriorityBadge, getStatusBadge } from "~/lib/utils"

const TaskDetail = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const searchParams = new URLSearchParams(location.search)
  const taskId = searchParams.get('id')

  const [users, setUsers] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const [isUsersDialogOpen, setIsUsersDialogOpen] = useState(false)
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [isUpdatingTask, setIsUpdatingTask] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false) // New state for status update
  const [isLoadingTask, setIsLoadingTask] = useState(false)
  const [originalData, setOriginalData] = useState(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [taskData, setTaskData] = useState(null)
  const [isEditMode, setIsEditMode] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      priority: "",
      dueDate: "",
      assignedTo: [],
      attachments: [],
      todoChecklist: [],
    },
  })

  const {
    fields: todoFields,
    append: appendTodo,
    remove: removeTodo,
    replace: replaceTodo,
  } = useFieldArray({
    control,
    name: "todoChecklist",
  })

  const {
    fields: attachmentFields,
    append: appendAttachment,
    remove: removeAttachment,
    replace: replaceAttachment,
  } = useFieldArray({
    control,
    name: "attachments",
  })

  const [newTodoText, setNewTodoText] = useState("")
  const [newAttachmentUrl, setNewAttachmentUrl] = useState("")

  // Watch all form values to detect changes (excluding status)
  const watchedValues = watch()

  // Check for changes (excluding status since it's handled separately)
  useEffect(() => {
    if (originalData && isEditMode) {
      const currentData = {
        title: watchedValues.title,
        description: watchedValues.description,
        priority: watchedValues.priority,
        dueDate: watchedValues.dueDate,
        assignedTo: watchedValues.assignedTo,
        attachments: watchedValues.attachments,
        todoChecklist: watchedValues.todoChecklist,
      }

      const hasFormChanges = JSON.stringify(currentData) !== JSON.stringify(originalData)
      setHasChanges(hasFormChanges)
    }
  }, [watchedValues, originalData, isEditMode])

  // Safe date formatting function
  const formatDateForInput = (dateString) => {
    try {
      if (!dateString) return ""

      const date = new Date(dateString)

      if (isNaN(date.getTime())) {
        console.warn("Invalid date:", dateString)
        return ""
      }

      return date.toISOString().split('T')[0]
    } catch (error) {
      console.error("Error formatting date:", error, dateString)
      return ""
    }
  }

  // Fetch task details
  const getTaskDetails = async (id) => {
    setIsLoadingTask(true)
    try {
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_TASK_BY_ID(id))
      if (response.data && response.data.statusCode === 200) {
        const task = response.data.data.task

        const formattedDate = formatDateForInput(task.dueDate)

        const formData = {
          title: task.title || "",
          description: task.description || "",
          priority: task.priority || "",
          dueDate: formattedDate,
          assignedTo: task.assignedTo ? task.assignedTo.map(user => user._id) : [],
          attachments: task.attachments ? task.attachments.filter(att => att && att.trim()).map(url => ({ url })) : [],
          todoChecklist: task.todoChecklist ? task.todoChecklist.map(item => ({
            text: item.text || "",
            completed: item.completed || false
          })) : [],
        }

        setTaskData(task)
        setOriginalData(formData)
        setSelectedUsers(formData.assignedTo)

        reset(formData)
      }
    } catch (error) {
      console.error("Error fetching task details:", error)
      toast.error("Failed to load task details")
      navigate('/admin/tasks')
    } finally {
      setIsLoadingTask(false)
    }
  }

  // Handle status update separately
  const handleStatusUpdate = async (newStatus) => {
    if (newStatus === taskData.status) return // No change

    setIsUpdatingStatus(true)
    try {
      const response = await axiosInstance.put(API_PATHS.TASKS.UPDATE_TASK_STATUS(taskId), {
        status: newStatus
      })

      if (response.data && response.data.statusCode === 200) {
        toast.success("Status updated successfully")

        // Update local task data
        setTaskData(prev => ({
          ...prev,
          status: newStatus
        }))
      }
    } catch (error) {
      console.error("Error updating task status:", error)
      toast.error("Failed to update status")
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  // Effect to populate form fields after data is loaded
  useEffect(() => {
    if (taskData && !isLoadingTask) {
      console.log("TaskData received:", taskData)

      const formData = {
        title: taskData.title || "",
        description: taskData.description || "",
        priority: taskData.priority || "",
        dueDate: formatDateForInput(taskData.dueDate),
        assignedTo: taskData.assignedTo ? taskData.assignedTo.map(user => user._id) : [],
        attachments: taskData.attachments ? taskData.attachments.filter(att => att && att.trim()).map(url => ({ url })) : [],
        todoChecklist: taskData.todoChecklist ? taskData.todoChecklist.map(item => ({
          text: item.text || "",
          completed: item.completed || false
        })) : [],
      }

      console.log("Form data prepared:", formData)

      setValue("title", formData.title)
      setValue("description", formData.description)
      setValue("priority", formData.priority)
      setValue("dueDate", formData.dueDate)
      setValue("assignedTo", formData.assignedTo)

      replaceTodo(formData.todoChecklist)
      replaceAttachment(formData.attachments)
    }
  }, [taskData, isLoadingTask, setValue, replaceTodo, replaceAttachment])

  // Fetch all users
  const getAllUsers = async () => {
    setIsLoadingUsers(true)
    try {
      const response = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS)
      if (response.data && response.data.statusCode === 200) {
        setUsers(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error("Failed to fetch users")
    } finally {
      setIsLoadingUsers(false)
    }
  }

  useEffect(() => {
    getAllUsers()
    if (taskId) {
      getTaskDetails(taskId)
    } else {
      navigate('/admin/tasks')
    }
  }, [taskId])

  // Handle user selection
  const handleUserSelection = (userId, isChecked) => {
    if (isChecked) {
      setSelectedUsers((prev) => [...prev, userId])
    } else {
      setSelectedUsers((prev) => prev.filter((id) => id !== userId))
    }
  }

  // Confirm user selection
  const handleConfirmUserSelection = () => {
    setValue("assignedTo", selectedUsers)
    setIsUsersDialogOpen(false)
  }

  // Add todo item
  const addTodoItem = (e) => {
    e.preventDefault()
    if (newTodoText.trim()) {
      appendTodo({ text: newTodoText.trim(), completed: false })
      setNewTodoText("")
    }
  }

  // Add attachment
  const addAttachment = (e) => {
    e.preventDefault()
    if (newAttachmentUrl.trim()) {
      appendAttachment({ url: newAttachmentUrl.trim() })
      setNewAttachmentUrl("")
    }
  }

  // Remove assigned user
  const removeAssignedUser = (userId) => {
    const newSelected = selectedUsers.filter((id) => id !== userId)
    setSelectedUsers(newSelected)
    setValue("assignedTo", newSelected)
  }

  // Get selected users data
  const getSelectedUsersData = () => {
    const assignedTo = watch("assignedTo") || []
    return users.filter((user) => assignedTo.includes(user._id))
  }

  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode)
    if (!isEditMode) {
      // Entering edit mode - reset form with current data
      if (originalData) {
        reset(originalData)
        setSelectedUsers(originalData.assignedTo)
      }
    }
  }

  // Discard changes
  const handleDiscard = () => {
    if (originalData) {
      reset(originalData)
      setSelectedUsers(originalData.assignedTo)
      setNewTodoText("")
      setNewAttachmentUrl("")
      setHasChanges(false)
      setIsEditMode(false)

      setTimeout(() => {
        setValue("title", originalData.title)
        setValue("description", originalData.description)
        setValue("priority", originalData.priority)
        setValue("dueDate", originalData.dueDate)
        setValue("assignedTo", originalData.assignedTo)
        replaceTodo(originalData.todoChecklist)
        replaceAttachment(originalData.attachments)
      }, 0)
    }
  }

  // Handle form submission (excluding status)
  const onSubmit = async (data) => {
    setIsUpdatingTask(true)
    try {
      const payload = {
        title: data.title,
        description: data.description,
        priority: data.priority,
        dueDate: new Date(data.dueDate).toISOString(),
        assignedTo: data.assignedTo,
        attachments: data.attachments.map((item) => (typeof item === "string" ? item : item.url)),
        todoChecklist: data.todoChecklist,
      }

      const response = await axiosInstance.put(API_PATHS.TASKS.UPDATE_TASK(taskId), payload)

      if (response.data && response.data.statusCode === 200) {
        toast.success("Update Task Successfully")

        const newOriginalData = {
          title: data.title,
          description: data.description,
          priority: data.priority,
          dueDate: data.dueDate,
          assignedTo: data.assignedTo,
          attachments: data.attachments,
          todoChecklist: data.todoChecklist,
        }

        setOriginalData(newOriginalData)
        setHasChanges(false)
        setIsEditMode(false)

        // Refresh task data
        await getTaskDetails(taskId)
      }
    } catch (error) {
      console.error("Error updating task:", error)
      toast.error("Failed to update task")
    } finally {
      setIsUpdatingTask(false)
    }
  }

  const selectedUsersData = getSelectedUsersData()

  if (isLoadingTask) {
    return (
      <DashBoardLayout>
        <div className="flex h-[400px] w-full items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading task details...</p>
          </div>
        </div>
      </DashBoardLayout>
    )
  }

  if (!taskData) {
    return (
      <DashBoardLayout>
        <div className="flex h-[400px] w-full items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-semibold">Task not found</h3>
            <p className="text-muted-foreground">The task you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/admin/tasks')} className="mt-4">
              Back
            </Button>
          </div>
        </div>
      </DashBoardLayout>
    )
  }

  return (
    <DashBoardLayout>
      <div className="flex-1 space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/tasks')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{isEditMode ? 'Edit Task' : 'Task Details'}</h1>
              <p className="text-sm text-muted-foreground">
                {isEditMode ? 'Update task details and assignments' : 'View task information and progress'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditMode ? (
              <Button onClick={toggleEditMode} className="flex items-center gap-2">
                <Edit3 className="h-4 w-4" />
                Edit Task
              </Button>
            ) : (
              <>
                {hasChanges && (
                  <Button
                    variant="outline"
                    onClick={handleDiscard}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Discard
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setIsEditMode(false)}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View Mode
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Task Overview Card - Only in View Mode */}
        {!isEditMode && (
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold">{taskData.title}</h2>
                    <div className="flex items-center gap-2">
                      {getPriorityBadge(taskData.priority)}
                    </div>
                  </div>
                  <div>
                    {getStatusBadge(taskData.status)}

                  </div>
                </div>
                <div className="flex gap-4 text-right text-sm text-muted-foreground">
                  {/* Status Update Dropdown */}
                  <Select
                    value={taskData.status}
                    onValueChange={handleStatusUpdate}
                    disabled={isUpdatingStatus}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                      {isUpdatingStatus && <RefreshCw className="ml-2 h-4 w-4 animate-spin" />}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">{getStatusBadge("Pending")}</SelectItem>
                      <SelectItem value="In Progress">{getStatusBadge("In Progress")}</SelectItem>
                      <SelectItem value="Completed">{getStatusBadge("Completed")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <div>
                    <p>Created: {formatDate(taskData.createdAt)}</p>
                    <p>Due: {formatDate(taskData.dueDate)}</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-muted-foreground">{taskData.description}</p>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    Progress: {taskData.todoChecklist?.filter(item => item.completed).length || 0} / {taskData.todoChecklist?.length || 0}
                  </span>
                  <span className="text-muted-foreground">{taskData.progress || 0}%</span>
                </div>
                <Progress value={taskData.progress || 0} className="h-2" />
              </div>

              {/* Assigned Users */}
              {taskData.assignedTo && taskData.assignedTo.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Assigned To</h4>
                  <div className="flex flex-wrap gap-2">
                    {taskData.assignedTo.map((user) => (
                      <div key={user._id} className="flex items-center gap-2 bg-muted rounded-lg p-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={user.profileImageUrl || "/placeholder.svg"} alt={user.name} className="object-contain"/>
                          <AvatarFallback className="text-xs">
                            {user.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{user.name}</span>
                        {user.role && getRoleBadge(user.role)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Edit Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
          <Card className="w-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Task Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Task Title */}
              <div className="space-y-1">
                <Label htmlFor="title" className="text-sm font-medium">
                  Task Title *
                </Label>
                <Input
                  id="title"
                  placeholder="Enter task title"
                  {...register("title", { required: "Task title is required" })}
                  className={errors.title ? "border-red-500" : ""}
                  disabled={!isEditMode}
                />
                {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
              </div>

              {/* Description */}
              <div className="space-y-1">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe task"
                  rows={3}
                  {...register("description", { required: "Description is required" })}
                  className={errors.description ? "border-red-500" : ""}
                  disabled={!isEditMode}
                />
                {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
              </div>

              {/* Priority, Due Date, Assign To */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Priority */}
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Priority *</Label>
                  <Select
                    value={watch("priority") || ""}
                    onValueChange={(value) => setValue("priority", value)}
                    disabled={!isEditMode}
                  >
                    <SelectTrigger className={errors.priority ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">
                        <div className={`flex items-center px-2 py-1 rounded ${getPriorityColor("Low")}`}>Low</div>
                      </SelectItem>
                      <SelectItem value="Medium">
                        <div className={`flex items-center px-2 py-1 rounded ${getPriorityColor("Medium")}`}>
                          Medium
                        </div>
                      </SelectItem>
                      <SelectItem value="High">
                        <div className={`flex items-center px-2 py-1 rounded ${getPriorityColor("High")}`}>High</div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.priority && <p className="text-xs text-red-500">Priority is required</p>}
                </div>

                {/* Due Date */}
                <div className="space-y-1">
                  <Label htmlFor="dueDate" className="text-sm font-medium">
                    Due Date *
                  </Label>
                  <Input
                    id="dueDate"
                    type="date"
                    {...register("dueDate", { required: "Due date is required" })}
                    className={errors.dueDate ? "border-red-500" : ""}
                    disabled={!isEditMode}
                  />
                  {errors.dueDate && <p className="text-xs text-red-500">{errors.dueDate.message}</p>}
                </div>

                {/* Assign To */}
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Assign To</Label>
                  <Dialog open={isUsersDialogOpen} onOpenChange={setIsUsersDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-transparent"
                        disabled={!isEditMode}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        {isEditMode ? 'Add Members' : 'View Members'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Select Users</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {isLoadingUsers ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin" />
                          </div>
                        ) : (
                          users.map((user) => (
                            <div
                              key={user._id}
                              className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                            >
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={user.profileImageUrl || "/placeholder.svg"} alt={user.name} className="object-contain"/>
                                <AvatarFallback>
                                  {user.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium truncate">{user.name}</p>
                                  {getRoleBadge(user.role)}
                                </div>
                                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                              </div>
                              <Checkbox
                                checked={selectedUsers.includes(user._id)}
                                onCheckedChange={(checked) => handleUserSelection(user._id, checked)}
                                disabled={!isEditMode}
                              />
                            </div>
                          ))
                        )}
                      </div>
                      <div className="flex justify-end space-x-2 pt-4 border-t">
                        <Button variant="outline" onClick={() => setIsUsersDialogOpen(false)}>
                          Cancel
                        </Button>
                        {isEditMode && (
                          <Button onClick={handleConfirmUserSelection}>Done</Button>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Selected Users Display */}
                  {selectedUsersData.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedUsersData.map((user) => (
                        <Badge key={user._id} variant="secondary" className="flex items-center gap-1 pr-1">
                          <Avatar className="h-4 w-4">
                            <AvatarImage src={user.profileImageUrl || "/placeholder.svg"} alt={user.name} className="object-contain"/>
                            <AvatarFallback className="text-xs">
                              {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs">{user.name}</span>
                          {isEditMode && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-red-100"
                              onClick={() => removeAssignedUser(user._id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* TODO Checklist */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckSquare className="h-5 w-5" />
                TODO Checklist
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Existing TODO items */}
              {todoFields.map((field, index) => (
                <div key={field.id} className="flex items-center space-x-3 p-2 border rounded-lg">
                  <Checkbox
                    checked={watch(`todoChecklist.${index}.completed`) || false}
                    onCheckedChange={(checked) => setValue(`todoChecklist.${index}.completed`, checked)}
                    disabled={!isEditMode}
                  />
                  <span className="flex-1 text-sm">
                    {field.text}
                  </span>
                  {isEditMode && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTodo(index)}
                      className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              {/* Add new TODO item - Only in edit mode */}
              {isEditMode && (
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter Task"
                    value={newTodoText}
                    onChange={(e) => setNewTodoText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        addTodoItem(e)
                      }
                    }}
                  />
                  <Button type="button" onClick={addTodoItem} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Paperclip className="h-5 w-5" />
                Attachments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Existing attachments */}
              {attachmentFields.map((field, index) => (
                <div key={field.id} className="flex items-center space-x-3 p-2 border rounded-lg">
                  <Link className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <a
                    href={field.url || field}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 truncate text-sm text-blue-600 hover:underline"
                  >
                    {field.url || field}
                  </a>
                  {isEditMode && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                      className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              {/* Add new attachment - Only in edit mode */}
              {isEditMode && (
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add File Link"
                    value={newAttachmentUrl}
                    onChange={(e) => setNewAttachmentUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        addAttachment(e)
                      }
                    }}
                  />
                  <Button type="button" onClick={addAttachment} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button - Only in edit mode */}
          {isEditMode && (
            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                size="lg"
                disabled={isUpdatingTask || !hasChanges}
                className="min-w-[150px]"
              >
                {isUpdatingTask ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    UPDATE TASK
                  </>
                )}
              </Button>
            </div>
          )}
        </form>
      </div>
    </DashBoardLayout>
  )
}

export default TaskDetail
