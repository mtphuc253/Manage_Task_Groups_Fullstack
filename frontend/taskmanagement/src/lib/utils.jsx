import { clsx } from "clsx";
import { User } from "lucide-react";
import { twMerge } from "tailwind-merge"
import { Badge } from "~/components/ui/badge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}


export const getStatusBadge = (status) => {
  const statusConfig = {
    Pending: {
      variant: "secondary",
      className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    },
    "In Progress": {
      variant: "default",
      className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    },
    Completed: {
      variant: "default",
      className: "bg-green-100 text-green-800 hover:bg-green-200",
    },
  }

  const config = statusConfig[status] || statusConfig["Pending"]
  return (
    <Badge variant="outline" className={config.className}>
      {status}
    </Badge>
  )
}

// Get priority color
export const getPriorityColor = (priority) => {
  switch (priority) {
    case "High":
      return "text-red-700 bg-red-100"
    case "Medium":
      return "text-orange-600 bg-orange-50"
    case "Low":
      return "text-green-600 bg-green-50"
    default:
      return "text-gray-600 bg-gray-50"
  }
}

export const getPriorityBadge = (priority) => {
  const priorityConfig = {
    Low: {
      className: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
    },
    Medium: {
      className: "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200",
    },
    High: {
      className: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
    },
  }

  const config = priorityConfig[priority] || priorityConfig["Low"]
  return (
    <Badge variant="outline" className={config.className}>
      {priority} Priority
    </Badge>
  )
}

// Get role badge
export const getRoleBadge = (role) => {
  if (role === "admin") {
    return (
      <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs">
        <Crown className="w-3 h-3 mr-1" />
        Admin
      </Badge>
    )
  }
  return (
    <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
      <User className="w-3 h-3 mr-1" />
      Member
    </Badge>
  )
}

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export const currentDate = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  day: "numeric",
  month: "short",
  year: "numeric",
})