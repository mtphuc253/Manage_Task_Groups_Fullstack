import User from '../models/User.js'
import { env } from '../config/environment.js'
import { authService } from '../services/authService.js'

import bcrypt, { hash } from 'bcryptjs'
import jwt from 'jsonwebtoken'

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, env.JWT_SECRET, { expiresIn: '7d' })
}


const registerUser = async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body);
    res.status(201).json(result);
  } catch (error) {
    // res.status(400).json({ message: error.message });
    next(error)
  }
}

const loginUser = async (req, res) => {
  try {

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const getUserProfile = async (req, res) => {
  try {

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const updateUserProfile = async (req, res) => {
  try {

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const authController = {
  registerUser, loginUser, getUserProfile, updateUserProfile
}