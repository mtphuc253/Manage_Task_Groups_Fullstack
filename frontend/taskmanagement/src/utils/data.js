import { FilePlus, LayoutDashboard, ListCheck, Users } from "lucide-react";

export const SIDE_MENU_DATA = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard, },
  { title: "Manage Task", url: "/admin/tasks", icon: ListCheck, },
  { title: "Create Task", url: "/admin/create-task", icon: FilePlus, },
  { title: "Team Member", url: "/admin/users", icon: Users, },
]

export const SIDE_MENU_USER_DATA = [
  { title: "Dashboard", url: "/user/dashboard", icon: LayoutDashboard, },
  { title: "My Task", url: "/user/my-tasks", icon: ListCheck, },
]

export const PRIORITY_DATA = [
  { label: "Low", value: "Low" },
  { label: "Medium", value: "Medium" },
  { label: "High", value: "High" }
]

export const STATUS_DATA = [
  { label: "Peding", value: "Peding" },
  { label: "In Progress", value: "In Progress" },
  { label: "Completed", value: "High" }
]