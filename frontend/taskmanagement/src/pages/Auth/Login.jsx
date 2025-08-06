import { useContext, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { Eye, EyeOff, Mail, Lock, LogIn } from "lucide-react"
import AuthLayout from "~/components/layouts/AuthLayout"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Alert, AlertTitle, AlertDescription } from '~/components/ui/alert'
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import axiosInstance from "~/utils/axiosInstance"
import { API_PATHS } from "~/utils/apiPaths"
import { UserContext } from "~/context/userContext"


const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { updateUser } = useContext(UserContext)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  const onSubmit = async (data) => {

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, data)
      const { token, role } = response.data.data
      const message = response.data.message

      toast.success(message)

      localStorage.setItem("token", token)
      updateUser(response.data.data)
      if (role === "admin") {
        navigate("/admin/dashboard")
      } else {
        navigate("/user/dashboard")
      }
    } catch (error) {
      const message = error?.response?.data?.message || "Login failed. Please try again."
      console.error(message)
    }
  }
  return (
    <AuthLayout>
      <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <LogIn className="h-8 w-8 text-blue-600" />
            Welcome Back
          </CardTitle>
          <CardDescription className="text-gray-600 text-lg">Sign in to your account to continue</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Please enter a valid email address",
                    },
                  })}
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="pl-10 pr-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  {...register("password", {
                    required: "Password is required",
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg"
            >
              {isSubmitting ? "Signing In..." : "Sign In"}
            </Button>

            {/* Sign Up Link */}
            <div className="text-center pt-4">
              <p className="text-gray-600">
                {"Don't have an account? "}
                <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                  Sign up here
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}

export default Login
