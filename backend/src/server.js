import { env } from './config/environment.js';
import { authRoutes } from './routes/authRoutes.js';
import { closeDatabase, connectToDatabase } from './config/db.js';
import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware.js';

import express from 'express'
import cors from 'cors'

const startServer = () => {

  const app = express();

  const HOSTNAME = env.APP_HOST
  const PORT = env.APP_PORT

  app.use(
    cors({
      origin: env.CLIENT_URL || "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  )

  app.use(express.json())

  app.use("/api/auth", authRoutes)
  // app.use("/api/users", userRoutes)
  // app.use("/api/tasks", taskRoutes)
  // app.use("/api/reports", reportRoutes)

 // Middleware xử lý lỗi tập trung
  app.use(errorHandlingMiddleware)

  app.listen(PORT, HOSTNAME, () => {
    console.log(`3. Hello ${env.AUTHOR}, I am running at http://${HOSTNAME}:${PORT}/`)
  })
  
  exitHook(() => {
    closeDatabase()
  })
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
  })


