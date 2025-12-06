require('dotenv').config({ path: './backend/.env' });
const db = require('./config/db');

async function updateBookingStatusEnum() {
  try {
    console.log('Updating booking status enum to include "completed"...');
    
    // Modify the enum to include 'completed'
    await db.query(`
      ALTER TABLE bookings 
      MODIFY COLUMN status ENUM('pending', 'confirmed', 'cancelled', 'completed') 
      DEFAULT 'pending'
    `);
    
    console.log('✓ Booking status enum updated successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error updating status enum:', err);
    process.exit(1);
  }
}

updateBookingStatusEnum();
