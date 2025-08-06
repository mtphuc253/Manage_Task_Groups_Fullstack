import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
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
import { toast } from "sonner"
import { Plus, Trash2, Link, CheckSquare, Loader2, X, UserPlus, Paperclip, Crown, User } from "lucide-react"
import { getPriorityColor, getRoleBadge } from "~/lib/utils"

const CreateTask = () => {
  const [users, setUsers] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const [isUsersDialogOpen, setIsUsersDialogOpen] = useState(false)
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [isCreatingTask, setIsCreatingTask] = useState(false)

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
  } = useFieldArray({
    control,
    name: "todoChecklist",
  })

  const {
    fields: attachmentFields,
    append: appendAttachment,
    remove: removeAttachment,
  } = useFieldArray({
    control,
    name: "attachments",
  })

  const [newTodoText, setNewTodoText] = useState("")
  const [newAttachmentUrl, setNewAttachmentUrl] = useState("")

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
  }, [])

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

  // Handle form submission
  const onSubmit = async (data) => {
    setIsCreatingTask(true)
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

      const response = await axiosInstance.post(API_PATHS.TASKS.CREATE_TASK, payload)

      if (response.data && response.data.statusCode === 201) {
        toast.success("Create Task Successfully")

        // Reset form and states
        reset()
        setSelectedUsers([])
        setNewTodoText("")
        setNewAttachmentUrl("")
      }
    } catch (error) {
      console.error("Error creating task:", error)
      toast.error("Failed to create task")
    } finally {
      setIsCreatingTask(false)
    }
  }

  const selectedUsersData = getSelectedUsersData()

  return (
    <DashBoardLayout>
      <div className="flex-1 space-y-6 p-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">Create Task</h1>
          <p className="text-sm text-muted-foreground">Create a new task and assign it to team members</p>
        </div>

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
                />
                {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
              </div>

              {/* Priority, Due Date, Assign To */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Priority */}
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Priority *</Label>
                  <Select onValueChange={(value) => setValue("priority", value)}>
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
                  <div className="relative">
                    <Input
                      id="dueDate"
                      type="date"
                      {...register("dueDate", { required: "Due date is required" })}
                      className={errors.dueDate ? "border-red-500" : ""}
                    />
                  </div>
                  {errors.dueDate && <p className="text-xs text-red-500">{errors.dueDate.message}</p>}
                </div>

                {/* Assign To */}
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Assign To</Label>
                  <Dialog open={isUsersDialogOpen} onOpenChange={setIsUsersDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Members
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
                              />
                            </div>
                          ))
                        )}
                      </div>
                      <div className="flex justify-end space-x-2 pt-4 border-t">
                        <Button variant="outline" onClick={() => setIsUsersDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleConfirmUserSelection}>Done</Button>
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
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-red-100"
                            onClick={() => removeAssignedUser(user._id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
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
                  <span className="flex-1 text-sm">{field.text}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTodo(index)}
                    className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {/* Add new TODO item */}
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
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Paperclip className="h-5 w-5" />
                Add Attachments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Existing attachments */}
              {attachmentFields.map((field, index) => (
                <div key={field.id} className="flex items-center space-x-3 p-2 border rounded-lg">
                  <Link className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="flex-1 truncate text-sm">{field.url || field}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttachment(index)}
                    className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {/* Add new attachment */}
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
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button type="submit" size="lg" disabled={isCreatingTask} className="min-w-[150px]">
              {isCreatingTask ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "CREATE TASK"
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashBoardLayout>
  )
}

export default CreateTask
