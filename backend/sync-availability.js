const db = require('./config/db');

/**
 * Sync all car availability based on current bookings
 * Run this script to fix any inconsistencies in the database
 */
async function syncCarAvailability() {
  try {
    console.log('🔄 Syncing car availability...\n');
    
    const today = new Date().toISOString().split('T')[0];
    
    // Find all cars with active bookings (should be unavailable)
    const [activeCars] = await db.query(`
      SELECT DISTINCT c.id, c.model, c.availability
      FROM cars c
      JOIN bookings b ON c.id = b.car_id
      WHERE b.start_date <= ? 
      AND b.end_date >= ?
      AND (b.status IS NULL OR b.status != 'cancelled')
    `, [today, today]);
    
    console.log(`Found ${activeCars.length} car(s) with active bookings:`);
    
    for (const car of activeCars) {
      if (car.availability === 1) {
        await db.query('UPDATE cars SET availability = 0 WHERE id = ?', [car.id]);
        console.log(`  ✅ ${car.model} (ID: ${car.id}) → Marked as UNAVAILABLE`);
      } else {
        console.log(`  ✓ ${car.model} (ID: ${car.id}) → Already unavailable`);
      }
    }
    
    // Find all cars without active bookings (should be available)
    const [availableCars] = await db.query(`
      SELECT c.id, c.model, c.availability
      FROM cars c
      WHERE c.id NOT IN (
        SELECT DISTINCT b.car_id
        FROM bookings b
        WHERE b.start_date <= ? 
        AND b.end_date >= ?
        AND (b.status IS NULL OR b.status != 'cancelled')
      )
    `, [today, today]);
    
    console.log(`\nFound ${availableCars.length} car(s) without active bookings:`);
    
    for (const car of availableCars) {
      if (car.availability === 0) {
        await db.query('UPDATE cars SET availability = 1 WHERE id = ?', [car.id]);
        console.log(`  ✅ ${car.model} (ID: ${car.id}) → Marked as AVAILABLE`);
      } else {
        console.log(`  ✓ ${car.model} (ID: ${car.id}) → Already available`);
      }
    }
    
    console.log('\n✅ Car availability sync completed!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error syncing car availability:', err);
    process.exit(1);
  }
}

syncCarAvailability();
