const db = require('../config/db');

/**
 * Check for expired bookings and make cars available again
 */
async function checkExpiredBookings() {
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    console.log(`[${new Date().toLocaleTimeString()}] Checking for expired bookings...`);
    
    // Find all bookings that have ended or are ending today
    // Use <= to include bookings ending today
    const [expiredBookings] = await db.query(`
      SELECT b.id, b.car_id, c.model, b.end_date
      FROM bookings b
      JOIN cars c ON b.car_id = c.id
      WHERE b.end_date <= ?
      AND c.availability = 0
      AND (b.status = 'confirmed' OR b.status = 'pending')
    `, [today]);
    
    if (expiredBookings.length > 0) {
      console.log(`Found ${expiredBookings.length} expired booking(s)`);
      
      for (const booking of expiredBookings) {
        // Mark car as available
        await db.query('UPDATE cars SET availability = 1 WHERE id = ?', [booking.car_id]);
        
        // Optionally update booking status to 'completed'
        await db.query('UPDATE bookings SET status = ? WHERE id = ?', ['completed', booking.id]);
        
        console.log(`✓ Car "${booking.model}" (ID: ${booking.car_id}) is now available again`);
      }
    } else {
      console.log('No expired bookings found');
    }
  } catch (err) {
    console.error('Error checking expired bookings:', err);
  }
}

/**
 * Start the booking scheduler
 * Runs every 5 minutes to check for expired bookings
 */
function startBookingScheduler() {
  console.log('📅 Booking scheduler started');
  console.log('⏰ Checking for expired bookings every 5 minutes');
  
  // Run immediately on startup
  checkExpiredBookings();
  
  // Run every 5 minutes (300000 ms) for more responsive updates
  setInterval(checkExpiredBookings, 300000);
  
  // For production: Run every hour (3600000 ms)
  // setInterval(checkExpiredBookings, 3600000);
}

module.exports = { startBookingScheduler, checkExpiredBookings };
