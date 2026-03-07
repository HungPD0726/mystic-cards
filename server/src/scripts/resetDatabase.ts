import sequelize from '../config/database';

/**
 * Script to drop all tables and recreate them.
 * Use this when you need to reset the database schema.
 */
const resetDatabase = async () => {
  try {
    console.log('Dropping all tables...');
    await sequelize.drop();

    console.log('Recreating tables...');
    await sequelize.sync({ force: true });

    console.log('Database reset successfully');
    console.log('All tables have been recreated with the latest schema');

    process.exit(0);
  } catch (error: any) {
    console.error('Error resetting database:', error);
    if (error.parent && error.parent.errors) {
      console.error('Detailed errors:', error.parent.errors);
    }
    process.exit(1);
  }
};

resetDatabase();
