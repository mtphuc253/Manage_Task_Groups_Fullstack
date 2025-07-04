import { env } from '../config/environment.js'
import User from '../models/User.js'
import jwt from 'jsonwebtoken'

const protect = async (req, res, next) => {
  try {
    let token = req.headers.authorization

    if (token && token.startsWith("Bearer")) {
      token = token.split(" ")[1]
      const decoded = jwt.verify(token, env.JWT_SECRET)
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } else {
      res.status(401).json({ message: "Unauthorized, no Token" })
    }
  } catch (error) {
    res.status(401).json({ message: "Token failed", error: error.message })
  }
}

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next()
  } else {
    res.status(403).json({ message: "Access denied, admin only" })
  }
}

export const authMiddleware = {
  protect, adminOnly
}