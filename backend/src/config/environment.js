import 'dotenv/config'

export const env = {
  AUTHOR: process.env.AUTHOR,

  MONGODB_URL: process.env.MONGODB_URL,
  DATABASE_NAME: process.env.DATABASE_NAME,

  APP_HOST: process.env.APP_HOST,
  APP_PORT: process.env.APP_PORT,

  JWT_SECRET: process.env.JWT_SECRET,
  ADMIN_INVITE_TOKEN: process.env.ADMIN_INVITE_TOKEN,

  BUILD_MODE: process.env.BUILD_MODE,
  CLIENT_URL: process.env.CLIENT_URL
}