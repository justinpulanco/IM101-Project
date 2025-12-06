require('dotenv').config({ path: './backend/.env' });
const db = require('./config/db');

async function addYearColumn() {
  try {
    console.log('Adding year column to cars table...');
    
    // Check if column already exists
    const [columns] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'cars' 
      AND COLUMN_NAME = 'year'
    `);
    
    if (columns.length > 0) {
      console.log('✓ Year column already exists');
    } else {
      // Add year column
      await db.query(`
        ALTER TABLE cars 
        ADD COLUMN year INT(4) NULL AFTER model
      `);
      console.log('✓ Year column added successfully');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

addYearColumn();
