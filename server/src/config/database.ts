import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import { User, Reading, Card, Spread, AIInterpretation, Favorite } from '../models';

dotenv.config();

type SupportedDialect = 'postgres' | 'mssql';

const toBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined) {
    return fallback;
  }

  return value.toLowerCase() === 'true';
};

const dialect: SupportedDialect =
  process.env.DB_DIALECT?.toLowerCase() === 'mssql' ? 'mssql' : 'postgres';
const isProduction = process.env.NODE_ENV === 'production';
const databaseUrl = process.env.DATABASE_URL;

const dialectOptions =
  dialect === 'postgres'
    ? toBoolean(process.env.DB_SSL, isProduction)
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: toBoolean(process.env.DB_SSL_REJECT_UNAUTHORIZED, false),
          },
        }
      : undefined
    : {
        options: {
          encrypt: toBoolean(process.env.DB_ENCRYPT, true),
          trustServerCertificate: toBoolean(process.env.DB_TRUST_SERVER_CERT, false),
        },
      };

const baseConfig = {
  dialect,
  models: [User, Card, Spread, Reading, AIInterpretation, Favorite],
  dialectOptions,
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, baseConfig)
  : new Sequelize({
      ...baseConfig,
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || (dialect === 'postgres' ? '5432' : '1433'), 10),
      database: process.env.DB_NAME || 'mystic_cards',
      username: process.env.DB_USER || (dialect === 'postgres' ? 'postgres' : 'sa'),
      password: process.env.DB_PASSWORD || '',
    });

export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');

    // Sync models with database (create tables if they do not exist).
    // Keep this conservative in production by not enabling force/alter here.
    await sequelize.sync();
    console.log('Database models synchronized');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

export default sequelize;
