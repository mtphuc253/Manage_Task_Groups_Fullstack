import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { env } from '../config/environment.js'
import ApiError from '../utils/ApiError.js'
import { v4 as uuidv4 } from 'uuid'
import { bucket } from '~/config/firebase.js'


const generateToken = (userId) => {
  return jwt.sign({ id: userId }, env.JWT_SECRET, { expiresIn: '7d' })
}


const registerUser = async ({ name, email, password, profileImageUrl, adminInviteToken }) => {
  const userExists = await User.findOne({ email })
  if (userExists) {
    throw new Error('User already exists')
  }

  // Determine user role: Admin if correct token is provide, otherwise Member
  let role = 'member'
  if (adminInviteToken) {
    if (adminInviteToken != env.ADMIN_INVITE_TOKEN) {
      throw new Error('Invalid admin invitation token')
    }
    role = 'admin'
  }

  //Hash password
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)

  //Create New User
  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
    profileImageUrl,
    role
  })

  const token = generateToken(newUser._id)

  return {
    _id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    profileImageUrl: newUser.profileImageUrl,
    token
  }
}


const login = async ({ email, password }) => {
  const user = await User.findOne({ email })
  if (!user) {
    throw new ApiError(401, 'Invalid email or password')
  }

  //Compare password
  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password')
  }

  const token = generateToken(user._id)

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    profileImageUrl: user.profileImageUrl,
    token
  }
}

const getUserProfile = async ({ user }) => {
  const userProfile = await User.findById(user._id).select('-password')
  if (!userProfile) {
    throw new ApiError(404, 'User not found')
  }

  return {
    userProfile
  }
}

const updateUserProfile = async ({ user, body }) => {
  const userProfile = await User.findById(user.id)
  if (!userProfile) {
    throw new ApiError(404, 'User not found')
  }

  userProfile.name = body.name || userProfile.name
  userProfile.email = body.email || userProfile.email

  if (body.password) {
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(body.password, salt)
  }

  const updateUser = await userProfile.save()
  const token = generateToken(updateUser._id)

  return {
    _id: updateUser._id,
    name: updateUser.name,
    email: updateUser.email,
    role: updateUser.role,
    profileImageUrl: updateUser.profileImageUrl,
    token
  }
}

const uploadImage = async (req) => {
  if (!req.file) {
    throw new ApiError(400, 'No file uploaded')
  }

  // Tạo tên file duy nhất để tránh trùng
  const fileName = `${uuidv4()}-${req.file.originalname}`
  const file = bucket.file(fileName)

  // Upload buffer lên Firebase Storage
  await file.save(req.file.buffer, {
    metadata: {
      contentType: req.file.mimetype,
      metadata: {
        firebaseStorageDownloadTokens: uuidv4() // token để truy cập file public
      }
    }
  })

  // Tạo public URL
  const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(
    fileName
  )}?alt=media`

  return { imageUrl: publicUrl }
}


export const authService = {
  registerUser,
  login,
  getUserProfile,
  updateUserProfile,
  uploadImage
}
