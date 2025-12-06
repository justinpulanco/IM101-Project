require('dotenv').config({ path: './backend/.env' });
const db = require('./config/db');

async function fixCarAvailability() {
  try {
    console.log('Updating car availability for confirmed bookings...');
    
    // Get all confirmed bookings
    const [confirmedBookings] = await db.query(`
      SELECT DISTINCT car_id 
      FROM bookings 
      WHERE status = 'confirmed'
    `);
    
    console.log(`Found ${confirmedBookings.length} cars with confirmed bookings`);
    
    for (const booking of confirmedBookings) {
      await db.query('UPDATE cars SET availability = 0 WHERE id = ?', [booking.car_id]);
      console.log(`✓ Car ID ${booking.car_id} marked as unavailable`);
    }
    
    console.log('✅ Done!');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

fixCarAvailability();
