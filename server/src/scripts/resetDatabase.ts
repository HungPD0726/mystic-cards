import sequelize from '../config/database';

/**
 * Script to drop all tables and recreate them
 * Use this when you need to reset the database schema
 */
const resetDatabase = async () => {
  try {
    console.log('🔄 Dropping all tables...');
    
    // Force sync will drop existing tables and recreate them
    await sequelize.sync({ force: true });
    
    console.log('✅ Database reset successfully');
    console.log('📊 All tables have been recreated with the latest schema');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  }
};

resetDatabase();
