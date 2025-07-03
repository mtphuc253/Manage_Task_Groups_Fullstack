import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { env } from '../config/environment.js';

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, env.JWT_SECRET, { expiresIn: '7d' });
};

const registerUser = async ({ name, email, password, profileImageUrl, adminInviteToken }) => {
  const userExists = await User.findOne({ email })
  if (userExists) {
    throw new Error('User already exists');
  }

  // Determine user role: Admin if correct token is provide, otherwise Member
  let role = 'member'
  if (adminInviteToken && adminInviteToken == env.ADMIN_INVITE_TOKEN) {
    role = 'admin'
  }

  //Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  //Create New User
  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
    profileImageUrl,
    role
  });

  const token = generateToken(newUser._id)

  const response = {
    _id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    profileImageUrl: newUser.profileImageUrl,
    token
  }

  console.log("response to client: ", response)
  return { response };
}

export const authService = {
  registerUser
}
