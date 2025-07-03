import mongoose from 'mongoose';
import { env } from './environment.js';

export const connectToDatabase = async () => {
  try {
    console.log('[1] Connecting to MongoDB...');
    await mongoose.connect(env.MONGODB_URL, {
      dbName: env.DATABASE_NAME
    });
    console.log(`[2] ✅ Connected to MongoDB: ${env.DATABASE_NAME}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw error;
  }
};

export const closeDatabase = async () => {
  try {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error);
  }
};
