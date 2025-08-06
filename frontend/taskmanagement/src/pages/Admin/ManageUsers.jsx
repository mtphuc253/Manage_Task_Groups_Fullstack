"use client"

import { useState, useEffect, useMemo } from "react"
import DashBoardLayout from "~/components/layouts/DashBoardLayout"
import { API_PATHS } from "~/utils/apiPaths"
import axiosInstance from "~/utils/axiosInstance"
import { Card, CardContent } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { toast } from "sonner"
import { Download, Loader2, Search, Users, SortAsc, SortDesc, Filter } from 'lucide-react'
import { getRoleBadge } from "~/lib/utils"

const ManageUsers = () => {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [sortOrder, setSortOrder] = useState("asc")

  // Fetch all users
  const getAllUsers = async () => {
    setIsLoading(true)
    try {
      const response = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS)
      if (response.data && response.data.statusCode === 200) {
        setUsers(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error("Failed to fetch users")
    } finally {
      setIsLoading(false)
    }
  }

  // Export users
  const exportUsers = async () => {
    setIsExporting(true)
    try {
      const response = await axiosInstance.get(API_PATHS.REPORTS.EXPORT_USERS, {
        responseType: 'blob'
      })

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `users-report-${new Date().toISOString().split('T')[0]}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success("Report downloaded successfully")
    } catch (error) {
      console.error("Error exporting users:", error)
      toast.error("Failed to download report")
    } finally {
      setIsExporting(false)
    }
  }

  useEffect(() => {
    getAllUsers()
  }, [])

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Sort users
    filtered.sort((a, b) => {
      let aValue, bValue

      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case "email":
          aValue = a.email.toLowerCase()
          bValue = b.email.toLowerCase()
          break
        case "completedTask":
          aValue = a.completedTask || 0
          bValue = b.completedTask || 0
          break
        case "totalTasks":
          aValue = (a.pendingTask || 0) + (a.inprogressTask || 0) + (a.completedTask || 0)
          bValue = (b.pendingTask || 0) + (b.inprogressTask || 0) + (b.completedTask || 0)
          break
        case "role":
          aValue = a.role
          bValue = b.role
          break
        default:
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [users, searchTerm, sortBy, sortOrder])

  // Get task statistics
  const getTaskStats = () => {
    const totalUsers = users.length
    const totalPending = users.reduce((sum, user) => sum + (user.pendingTask || 0), 0)
    const totalInProgress = users.reduce((sum, user) => sum + (user.inprogressTask || 0), 0)
    const totalCompleted = users.reduce((sum, user) => sum + (user.completedTask || 0), 0)

    return { totalUsers, totalPending, totalInProgress, totalCompleted }
  }

  const stats = getTaskStats()

  if (isLoading) {
    return (
      <DashBoardLayout>
        <div className="flex h-[400px] w-full items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading team members...</p>
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
            <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
            <p className="text-muted-foreground">Manage your team and track their progress</p>
          </div>
          <Button
            onClick={exportUsers}
            disabled={isExporting}
            className="bg-green-600 hover:bg-green-700"
          >
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

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Members</p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Pending</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalPending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-teal-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total In Progress</p>
                  <p className="text-2xl font-bold text-teal-600">{stats.totalInProgress}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.totalCompleted}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Sort Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="role">Role</SelectItem>
                <SelectItem value="completedTask">Completed Tasks</SelectItem>
                <SelectItem value="totalTasks">Total Tasks</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            >
              {sortOrder === "asc" ? (
                <SortAsc className="h-4 w-4" />
              ) : (
                <SortDesc className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Users Grid */}
        {filteredAndSortedUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-gray-100 p-6 mb-4">
              <Users className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No members found</h3>
            <p className="text-gray-500 max-w-sm">
              {searchTerm ? "No members match your search criteria." : "No team members available."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedUsers.map((user) => (
              <Card key={user._id} className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6">
                  {/* User Info */}
                  <div className="flex items-center space-x-4 mb-6">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={user.profileImageUrl || "/placeholder.svg"}
                        alt={user.name}
                        className="object-contain"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                        {user.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg truncate">{user.name}</h3>
                        {getRoleBadge(user.role)}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>

                  {/* Task Statistics */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        {user.pendingTask || 0}
                      </div>
                      <div className="text-xs text-purple-600 font-medium">Pending</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-teal-600 mb-1">
                        {user.inprogressTask || 0}
                      </div>
                      <div className="text-xs text-teal-600 font-medium">In Progress</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {user.completedTask || 0}
                      </div>
                      <div className="text-xs text-green-600 font-medium">Completed</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Task Progress</span>
                      <span>
                        {user.completedTask || 0} / {(user.pendingTask || 0) + (user.inprogressTask || 0) + (user.completedTask || 0)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${((user.completedTask || 0) /
                              Math.max(1, (user.pendingTask || 0) + (user.inprogressTask || 0) + (user.completedTask || 0))) * 100
                            }%`
                        }}
                      />
                    </div>
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

export default ManageUsers
