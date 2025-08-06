import React, { useContext } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  Navigate
} from "react-router-dom"
import Login from './pages/Auth/Login'
import SignUp from './pages/Auth/SignUp'
import PrivateRoute from './routes/PrivateRoute'
import AdminDashboard from './pages/Admin/AdminDashboard'
import UserDashboard from './pages/User/UserDashboard'
import MyTasks from './pages/User/MyTasks'
import ManageTasks from './pages/Admin/ManageTasks'
import CreateTask from './pages/Admin/CreateTask'
import ManageUsers from './pages/Admin/ManageUsers'
import ViewTaskDetails from './pages/User/ViewTaskDetails'
import { Toaster } from 'sonner'
import UserProvider, { UserContext } from '~/context/userContext'
import TaskDetail from '~/pages/Admin/TaskDetail'

const App = () => {
  return (
    <Router>
      <UserProvider>
        <div>
          <Toaster duration={2000} position="bottom-center" richColors />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signUp" element={<SignUp />} />

            {/* Admin Routes */}
            <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/tasks" element={<ManageTasks />} />
              <Route path="/admin/create-task" element={<CreateTask />} />
              <Route path="/admin/users" element={<ManageUsers />} />
              <Route path="/admin/task-detail" element={<TaskDetail />} />
            </Route>

            {/* User Routes */}
            <Route element={<PrivateRoute allowedRoles={["user"]} />}>
              <Route path="/user/dashboard" element={<UserDashboard />} />
              <Route path="/user/my-tasks" element={<MyTasks />} />
              <Route path="/user/task-detail" element={<ViewTaskDetails />} />
            </Route>

            <Route path="/" element={<Root />} />
          </Routes>
        </div>
      </UserProvider>
    </Router>
  )
}

export default App

const Root = () => {
  const { user, loading } = useContext(UserContext)

  if (loading) return <Outlet />

  if (!user) {
    return <Navigate to="/login" />
  }

  return user.role === "admin" ? <Navigate to="/admin/dashboard" /> : <Navigate to="/user/dashboard" />
}