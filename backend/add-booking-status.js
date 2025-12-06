require('dotenv').config({ path: './backend/.env' });
const db = require('./config/db');

async function addBookingStatus() {
  try {
    console.log('Adding status column to bookings table...');
    
    // Check if column already exists
    const [columns] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'bookings' 
      AND COLUMN_NAME = 'status'
    `);
    
    if (columns.length > 0) {
      console.log('✓ Status column already exists');
      process.exit(0);
    }
    
    // Add status column
    await db.query(`
      ALTER TABLE bookings 
      ADD COLUMN status ENUM('pending', 'confirmed', 'cancelled') 
      DEFAULT 'pending' 
      AFTER total_price
    `);
    
    console.log('✓ Status column added successfully');
    
    // Update existing bookings to 'pending'
    await db.query(`UPDATE bookings SET status = 'pending' WHERE status IS NULL`);
    console.log('✓ Existing bookings updated to pending status');
    
    process.exit(0);
  } catch (err) {
    console.error('Error adding status column:', err);
    process.exit(1);
  }
}

addBookingStatus();
