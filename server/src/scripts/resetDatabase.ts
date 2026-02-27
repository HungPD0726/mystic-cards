import sequelize from '../config/database';
import { User, Card, Spread, Reading, AIInterpretation, Favorite } from '../models';

/**
 * Script to drop all tables and recreate them
 * Use this when you need to reset the database schema
 */
const resetDatabase = async () => {
  try {
    console.log('🔄 Dropping all tables manually to ensure order...');
    
    // Drop in correct order to avoid FK constraints
    await sequelize.query('IF OBJECT_ID(\'dbo.ai_interpretations\', \'U\') IS NOT NULL DROP TABLE dbo.ai_interpretations;');
    await sequelize.query('IF OBJECT_ID(\'dbo.favorites\', \'U\') IS NOT NULL DROP TABLE dbo.favorites;');
    await sequelize.query('IF OBJECT_ID(\'dbo.readings\', \'U\') IS NOT NULL DROP TABLE dbo.readings;');
    await sequelize.query('IF OBJECT_ID(\'dbo.users\', \'U\') IS NOT NULL DROP TABLE dbo.users;');
    await sequelize.query('IF OBJECT_ID(\'dbo.cards\', \'U\') IS NOT NULL DROP TABLE dbo.cards;');
    await sequelize.query('IF OBJECT_ID(\'dbo.spreads\', \'U\') IS NOT NULL DROP TABLE dbo.spreads;');

    console.log('🔄 Creating tables in specific order...');
    
    // Create in correct order of dependencies
    await User.sync({ force: true });
    await Card.sync({ force: true });
    await Spread.sync({ force: true });
    await Reading.sync({ force: true });
    await AIInterpretation.sync({ force: true });
    await Favorite.sync({ force: true });
    
    console.log('✅ Database reset successfully');
    console.log('📊 All tables have been recreated with the latest schema');
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error resetting database:', error);
    if (error.parent && error.parent.errors) {
      console.error('Detailed errors:', error.parent.errors);
    }
    process.exit(1);
  }
};

resetDatabase();
