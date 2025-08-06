/* eslint-disable no-unused-vars */
import { useContext, useEffect, useState } from "react"
import DashBoardLayout from "~/components/layouts/DashBoardLayout"
import { UserContext } from "~/context/userContext"
import { useUserAuth } from "~/hooks/useUserAuth"
import { API_PATHS } from "~/utils/apiPaths"
import axiosInstance from "~/utils/axiosInstance"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Separator } from "~/components/ui/separator"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "~/components/ui/chart"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"
import {
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Loader2,
  BarChart3,
  PieChartIcon,
  TrendingUp,
  Activity,
} from "lucide-react"
import StatCard from "~/components/layouts/StatCard"
import { currentDate, formatDate, getPriorityBadge, getStatusBadge } from "~/lib/utils"
import { useNavigate } from "react-router-dom"

const LoadingScreen = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading dashboard...</p>
      </div>
    </div>
  )
}

const TaskTable = ({ tasks }) => {
  const navigate = useNavigate()

  const onSeeAll = () => {
    navigate('/admin/tasks')
  }

  // Limit to maximum 8 tasks
  const limitedTasks = tasks.slice(0, 8)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Recent Tasks</CardTitle>
          <Button onClick={onSeeAll} variant="ghost" size="sm" className="text-primary hover:text-primary/80 cursor-pointer" >
            See All
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Priority</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Created On</th>
                </tr>
              </thead>
              <tbody>
                {limitedTasks.map((task, index) => (
                  <tr
                    key={task._id}
                    className={`border-b transition-colors hover:bg-muted/50 ${index === limitedTasks.length - 1 ? "border-b-0" : ""
                      }`}
                  >
                    <td className="p-4 align-middle font-medium">{task.title}</td>
                    <td className="p-4 align-middle">{getStatusBadge(task.status)}</td>
                    <td className="p-4 align-middle">{getPriorityBadge(task.priority)}</td>
                    <td className="p-4 align-middle text-muted-foreground">{formatDate(task.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const AdminDashboard = () => {
  useUserAuth()
  const { user, loading } = useContext(UserContext)
  const [dashboardData, setDashboardData] = useState(null)
  const [isLoadingData, setIsLoadingData] = useState(false)

  const getDashBoardData = async () => {
    setIsLoadingData(true)
    try {
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_DASHBOARD_DATA)
      if (response.data) {
        setDashboardData(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching data", error)
    } finally {
      setIsLoadingData(false)
    }
  }

  useEffect(() => {
    if (user) {
      getDashBoardData()
    }
  }, [user])

  if (loading || !user) return <LoadingScreen />

  if (isLoadingData || !dashboardData) {
    return (
      <DashBoardLayout>
        <div className="flex h-[400px] w-full items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
      </DashBoardLayout>
    )
  }

  const { statistics, charts, recentTasks } = dashboardData

  // Calculate in-progress tasks
  const inProgressTasks = statistics.totalTasks - statistics.pendingTasks - statistics.completedTasks

  // Prepare pie chart data
  const pieChartData = Object.entries(charts.taskDistribution)
    .filter(([key]) => key !== "All")
    .map(([key, value]) => ({
      name: key === "InProgress" ? "In Progress" : key,
      value: value,
      fill:
        key === "Pending"
          ? "var(--chart-1)"
          : key === "InProgress"
            ? "var(--chart-2)"
            : "var(--chart-3)",
    }))

  // Prepare bar chart data
  const barChartData = Object.entries(charts.taskPriorityLevels).map(([key, value]) => ({
    name: key,
    value: value,
    fill: key === "Low" ? "var(--chart-3)" : key === "Medium" ? "var(--chart-4)" : "var(--chart-5)",
  }))


  const chartConfig = {
    Pending: {
      label: "Pending",
      color: "var(--chart-1)",
    },
    "In Progress": {
      label: "In Progress",
      color: "var(--chart-2)",
    },
    Completed: {
      label: "Completed",
      color: "var(--chart-3)",
    },
    Low: {
      label: "Low Priority",
      color: "var(--chart-3)",
    },
    Medium: {
      label: "Medium Priority",
      color: "var(--chart-4)",
    },
    High: {
      label: "High Priority",
      color: "var(--chart-5)",
    },
  }

  return (
    <DashBoardLayout>
      <div className="flex-1 space-y-6 p-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Good Morning! {user.name || user.email || "User"}</h1>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">{currentDate}</span>
          </div>
        </div>

        <Separator />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Tasks"
            value={statistics.totalTasks}
            icon={Activity}
            description="All tasks in system"
          />
          <StatCard title="Pending Tasks" value={statistics.pendingTasks} icon={Clock} description="Awaiting action" />
          <StatCard title="In Progress" value={inProgressTasks} icon={TrendingUp} description="Currently active" />
          <StatCard
            title="Completed Tasks"
            value={statistics.completedTasks}
            icon={CheckCircle2}
            description="Successfully finished"
          />
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Pie Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <PieChartIcon className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Task Distribution</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="flex justify-center mt-4 space-x-6">
                {pieChartData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.fill }} />
                    <span className="text-sm text-muted-foreground">{entry.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Bar Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Task Priority Levels</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Tasks Table */}
        <TaskTable tasks={recentTasks} />
      </div>
    </DashBoardLayout>
  )
}

export default AdminDashboard
