import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { Eye, EyeOff, Mail, Lock, User, UserPlus, Upload, X, Shield } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Switch } from "~/components/ui/switch"
import AuthLayout from "~/components/layouts/AuthLayout"
import axiosInstance from "~/utils/axiosInstance"
import { API_PATHS } from "~/utils/apiPaths"
import { toast } from "sonner"
import uploadImage from "~/utils/uploadImage"

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)

  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm()

  const onSubmit = async (data) => {
    if (avatarFile) {
      const imageData = await uploadImage(avatarFile)
      data.profileImageUrl = imageData.imageUrl // gán URL trả về
    } else {
      data.profileImageUrl = ''
    }

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, data)
      const resStatus = response.data.statusCode
      const resMessage = response.data.message

      toast.success(resMessage)

      if (resStatus === 201) {
        navigate("/login")
      }
    } catch (error) {
      const message = error?.response?.data?.message || "Sign up failed. Please try again."
      console.error(message)
    }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeAvatar = () => {
    setAvatarFile(null)
    setAvatarPreview(null)
    setValue("profileImageUrl", "")
    // Reset file input
    const fileInput = document.getElementById("profileImageUrl")
    if (fileInput) {
      fileInput.value = ""
    }
  }

  return (
    <AuthLayout>
      <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <UserPlus className="h-8 w-8 text-blue-600" />
            Create Account
          </CardTitle>
          <CardDescription className="text-gray-600 text-lg">Join us and start organizing your tasks</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700 font-medium">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  {...register("name", {
                    required: "Name is required",
                    minLength: {
                      value: 4,
                      message: "Name must be at least 4 characters",
                    },
                    maxLength: {
                      value: 50,
                      message: "Name must not exceed 50 characters",
                    },
                  })}
                />
              </div>
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>

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
                  placeholder="Create a strong password"
                  className="pl-10 pr-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                    maxLength: {
                      value: 20,
                      message: "Password must not exceed 20 characters",
                    },
                    pattern: {
                      value: /^(?=.*[A-Za-z])(?=.*\d)/,
                      message: "Password must contain at least one letter and one number",
                    },
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

            {/* Admin Switch */}
            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600" />
              <Label htmlFor="admin-switch" className="text-gray-700 font-medium flex-1">
                Register as Administrator
              </Label>
              <Switch id="admin-switch" checked={isAdmin} onCheckedChange={setIsAdmin} />
            </div>

            {/* Admin Invite Token */}
            {isAdmin && (
              <div className="space-y-2">
                <Label htmlFor="adminInviteToken" className="text-gray-700 font-medium">
                  Admin Invite Token
                </Label>
                <Input
                  id="adminInviteToken"
                  type="text"
                  placeholder="Enter 8-digit admin token"
                  maxLength={8}
                  className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  {...register("adminInviteToken", {
                    required: isAdmin ? "Admin invite token is required" : false,
                    pattern: {
                      value: /^\d{8}$/,
                      message: "Admin token must be exactly 8 digits",
                    },
                  })}
                />
                {errors.adminInviteToken && <p className="text-red-500 text-sm">{errors.adminInviteToken.message}</p>}
              </div>
            )}

            {/* Avatar Upload */}
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Profile Picture (Optional)</Label>

              {!avatarPreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-2">Click to upload your avatar</p>
                  <Input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="profileImageUrl"
                    onChange={handleAvatarChange}
                  />
                  <Label
                    htmlFor="profileImageUrl"
                    className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Choose File
                  </Label>
                </div>
              ) : (
                <div className="relative inline-block">
                  <img
                    src={avatarPreview || "/placeholder.svg"}
                    alt="Avatar preview"
                    className="w-24 h-24 rounded-full object-cover border-4 border-blue-200"
                  />
                  <button
                    type="button"
                    onClick={removeAvatar}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg"
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </Button>

            {/* Login Link */}
            <div className="text-center pt-4">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}

export default SignUp
