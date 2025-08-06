/* eslint-disable no-console */
/* eslint-disable no-undef */
import { env } from './config/environment.js'
import { authRoutes } from './routes/authRoutes.js'
import { closeDatabase, connectToDatabase } from './config/db.js'
import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware.js'

import path from 'path'

import cors from 'cors'
import express from 'express'
import { userRoutes } from './routes/userRoutes.js'
import { taskRoutes } from './routes/taskRoutes.js'
import { reportRoutes } from './routes/reportRoutes.js'

const startServer = () => {

  const app = express()

  const HOSTNAME = env.APP_HOST
  const PORT = env.APP_PORT

  app.use(
    cors({
      origin: env.CLIENT_URL || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization']
    })
  )

  app.use(express.json())

  app.use('/api/auth', authRoutes)
  app.use('/api/users', userRoutes)
  app.use('/api/tasks', taskRoutes)
  app.use('/api/reports', reportRoutes)

  app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
  // Middleware xử lý lỗi tập trung
  app.use(errorHandlingMiddleware)

  app.listen(PORT, HOSTNAME, () => {
    console.log(`3. Hello ${env.AUTHOR}, I am running at http://${HOSTNAME}:${PORT}/`)
  })

  // exitHook(() => {
  //   closeDatabase()
  // })
}

console.log('1. Start Connecting to MongoDB...')
connectToDatabase()
  .then(() => {
    console.log('2. Connected to MongoDB successfully!')
  })
  .then(() => {
    startServer()
  })
  .catch((error) => {
    console.log(error)
  })


