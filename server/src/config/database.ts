import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import { User, Reading, Card, Spread, AIInterpretation, Favorite } from '../models';

dotenv.config();

const sequelize = new Sequelize({
  dialect: 'mssql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433'),
  database: process.env.DB_NAME || 'mystic_cards',
  username: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '',
  models: [User, Card, Spread, Reading, AIInterpretation, Favorite],
  dialectOptions: {
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  },
  logging: false, // Tắt SQL logging để tránh lỗi encoding trên Windows
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    
    // Sync models with database (create tables if they don't exist)
    // Note: Using sync() without alter/force to avoid SQL Server ALTER COLUMN issues
    await sequelize.sync();
    console.log('✅ Database models synchronized');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
};

export default sequelize;
