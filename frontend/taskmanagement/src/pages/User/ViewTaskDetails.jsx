"use client"

import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import DashBoardLayout from "~/components/layouts/DashBoardLayout"
import { API_PATHS } from "~/utils/apiPaths"
import axiosInstance from "~/utils/axiosInstance"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Badge } from "~/components/ui/badge"
import { Progress } from "~/components/ui/progress"
import { Checkbox } from "~/components/ui/checkbox"
import { toast } from "sonner"
import { ArrowLeft, Loader2, CheckSquare, Paperclip, Link, RefreshCw, RotateCcw, Save, AlertCircle } from 'lucide-react'
import { getRoleBadge, formatDate, getPriorityBadge, getStatusBadge } from "~/lib/utils"

const ViewTaskDetails = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const searchParams = new URLSearchParams(location.search)
  const taskId = searchParams.get('id')

  const [taskData, setTaskData] = useState(null)
  const [isLoadingTask, setIsLoadingTask] = useState(false)
  const [isUpdatingChecklist, setIsUpdatingChecklist] = useState(false)
  const [todoChecklist, setTodoChecklist] = useState([])
  const [originalTodoChecklist, setOriginalTodoChecklist] = useState([]) // Add this
  const [hasChecklistChanges, setHasChecklistChanges] = useState(false) // Add this

  // Fetch task details
  const getTaskDetails = async (id) => {
    setIsLoadingTask(true)
    try {
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_TASK_BY_ID(id))
      if (response.data && response.data.statusCode === 200) {
        const task = response.data.data.task
        setTaskData(task)
        const checklist = task.todoChecklist || []
        setTodoChecklist(checklist)
        setOriginalTodoChecklist(checklist) // Set original data
        setHasChecklistChanges(false) // Reset changes
      }
    } catch (error) {
      console.error("Error fetching task details:", error)
      toast.error("Failed to load task details")
      navigate('/user/my-tasks')
    } finally {
      setIsLoadingTask(false)
    }
  }

  // Handle checkbox change (no auto-save)
  const handleCheckboxChange = (index, checked) => {
    const updatedChecklist = [...todoChecklist]
    updatedChecklist[index] = {
      ...updatedChecklist[index],
      completed: checked
    }
    setTodoChecklist(updatedChecklist)
  }

  // Handle update checklist
  const handleUpdateChecklist = async () => {
    setIsUpdatingChecklist(true)
    try {
      const response = await axiosInstance.put(API_PATHS.TASKS.UPDATE_TASK_CHECKLIST(taskId), {
        todoChecklist: todoChecklist
      })

      if (response.data && response.data.statusCode === 200) {
        toast.success("Checklist updated successfully")
        // Update original data and reset changes
        setOriginalTodoChecklist(todoChecklist)
        setHasChecklistChanges(false)
        // Refresh task data to get updated progress
        await getTaskDetails(taskId)
      }
    } catch (error) {
      console.error("Error updating checklist:", error)
      toast.error("Failed to update checklist")
    } finally {
      setIsUpdatingChecklist(false)
    }
  }

  // Handle discard changes
  const handleDiscardChanges = () => {
    setTodoChecklist(originalTodoChecklist)
    setHasChecklistChanges(false)
    toast.info("Changes discarded")
  }

  useEffect(() => {
    if (taskId) {
      getTaskDetails(taskId)
    } else {
      navigate('/user/my-tasks')
    }
  }, [taskId])

  // Add this useEffect after the existing useEffect
  useEffect(() => {
    // Check if there are changes in the checklist
    const hasChanges = JSON.stringify(todoChecklist) !== JSON.stringify(originalTodoChecklist)
    setHasChecklistChanges(hasChanges)
  }, [todoChecklist, originalTodoChecklist])

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
            <Button onClick={() => navigate('/user/my-tasks')} className="mt-4">
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
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/user/my-tasks')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Task Details</h1>
            <p className="text-sm text-muted-foreground">
              View task information and update your progress
            </p>
          </div>
        </div>

        {/* Task Overview Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">{taskData.title}</h2>
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(taskData.priority)}
                    {getStatusBadge(taskData.status)}
                  </div>
                </div>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>Created: {formatDate(taskData.createdAt)}</p>
                <p>Due: {formatDate(taskData.dueDate)}</p>
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

        {/* TODO Checklist */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckSquare className="h-5 w-5" />
                TODO Checklist
                {isUpdatingChecklist && <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />}
              </CardTitle>
              
              {/* Update and Discard buttons */}
              {hasChecklistChanges && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDiscardChanges}
                    disabled={isUpdatingChecklist}
                    className="flex items-center gap-1"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Discard
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleUpdateChecklist}
                    disabled={isUpdatingChecklist}
                    className="flex items-center gap-1"
                  >
                    {isUpdatingChecklist ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Update
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {todoChecklist.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No checklist items available</p>
              </div>
            ) : (
              todoChecklist.map((item, index) => (
                <div key={item._id || index} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox
                    checked={item.completed || false}
                    onCheckedChange={(checked) => handleCheckboxChange(index, checked)}
                    disabled={isUpdatingChecklist}
                    className="flex-shrink-0"
                  />
                  <span 
                    className={`flex-1 text-sm transition-all ${
                      item.completed 
                        ? 'line-through text-muted-foreground' 
                        : 'text-foreground'
                    }`}
                  >
                    {item.text}
                  </span>
                  {item.completed && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                      Done
                    </Badge>
                  )}
                </div>
              ))
            )}
            
            {/* Changes indicator */}
            {hasChecklistChanges && (
              <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                <AlertCircle className="h-4 w-4" />
                <span>You have unsaved changes in the checklist</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attachments */}
        {taskData.attachments && taskData.attachments.filter(att => att && att.trim()).length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Paperclip className="h-5 w-5" />
                Attachments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {taskData.attachments
                .filter(att => att && att.trim())
                .map((attachment, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 border rounded-lg hover:bg-muted/50 transition-colors">
                    <Link className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <a
                      href={attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 truncate text-sm text-blue-600 hover:underline"
                    >
                      {attachment}
                    </a>
                  </div>
                ))}
            </CardContent>
          </Card>
        )}
      </div>
    </DashBoardLayout>
  )
}

export default ViewTaskDetails
