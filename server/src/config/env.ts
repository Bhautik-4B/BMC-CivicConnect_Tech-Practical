import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/bmc_civic_connect',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'bmc_jwt_access_super_secret_key_2026_xYz123',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'bmc_jwt_refresh_super_secret_key_2026_aBc987',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
};
