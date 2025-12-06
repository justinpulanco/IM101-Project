const db = require('../config/db');

/**
 * Update car availability based on current bookings
 * This ensures cars show correct availability status in real-time
 */
exports.updateCarAvailability = async (req, res) => {
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Find all cars that should be unavailable (have active bookings)
    const [activeCars] = await db.query(`
      SELECT DISTINCT c.id, c.model
      FROM cars c
      JOIN bookings b ON c.id = b.car_id
      WHERE b.start_date <= ? 
      AND b.end_date >= ?
      AND (b.status IS NULL OR b.status != 'cancelled')
    `, [today, today]);
    
    // Find all cars that should be available (no active bookings)
    const [availableCars] = await db.query(`
      SELECT c.id, c.model
      FROM cars c
      WHERE c.id NOT IN (
        SELECT DISTINCT b.car_id
        FROM bookings b
        WHERE b.start_date <= ? 
        AND b.end_date >= ?
        AND (b.status IS NULL OR b.status != 'cancelled')
      )
    `, [today, today]);
    
    // Update unavailable cars
    if (activeCars.length > 0) {
      const carIds = activeCars.map(c => c.id);
      await db.query('UPDATE cars SET availability = 0 WHERE id IN (?)', [carIds]);
      console.log(`Marked ${activeCars.length} car(s) as unavailable`);
    }
    
    // Update available cars
    if (availableCars.length > 0) {
      const carIds = availableCars.map(c => c.id);
      await db.query('UPDATE cars SET availability = 1 WHERE id IN (?)', [carIds]);
      console.log(`Marked ${availableCars.length} car(s) as available`);
    }
    
    res.json({ 
      message: 'Car availability updated',
      unavailable: activeCars.length,
      available: availableCars.length
    });
  } catch (err) {
    console.error('Error updating car availability:', err);
    res.status(500).json({ message: 'DB error', error: err.message });
  }
};

/**
 * Check if a specific car is available for given dates
 */
exports.checkCarAvailability = async (req, res) => {
  const { car_id, start_date, end_date } = req.body;
  
  if (!car_id || !start_date || !end_date) {
    return res.status(400).json({ 
      message: 'car_id, start_date, and end_date required', 
      available: false 
    });
  }

  try {
    // Check if car exists
    const [carResults] = await db.query('SELECT * FROM cars WHERE id = ?', [car_id]);
    if (carResults.length === 0) {
      return res.json({ available: false, message: 'Car not found' });
    }

    // Check for overlapping bookings
    const overlapQuery = `
      SELECT * FROM bookings 
      WHERE car_id = ? 
      AND (start_date < ? AND end_date > ?)
      AND (status IS NULL OR status != 'cancelled')
    `;
    const [overlapResults] = await db.query(overlapQuery, [car_id, end_date, start_date]);
    
    if (overlapResults.length > 0) {
      return res.json({ 
        available: false, 
        message: 'Car already booked for these dates' 
      });
    }

    res.json({ 
      available: true, 
      message: 'Car is available for booking' 
    });
  } catch (err) {
    res.status(500).json({ 
      available: false, 
      message: 'DB error', 
      error: err.message 
    });
  }
};

/**
 * Manually trigger the booking scheduler to check for expired bookings
 * Useful for testing and immediate updates
 */
exports.checkExpiredBookings = async (req, res) => {
  try {
    const { checkExpiredBookings } = require('../utils/bookingScheduler');
    await checkExpiredBookings();
    res.json({ 
      message: 'Expired bookings check completed',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error checking expired bookings:', err);
    res.status(500).json({ 
      message: 'Error checking expired bookings', 
      error: err.message 
    });
  }
};
