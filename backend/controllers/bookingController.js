const db = require('../config/db');

exports.createBooking = async (req, res) => {
  const { user_id, car_id, start_date, end_date, total_price } = req.body;
  console.log('createBooking called with body:', req.body);
  if (!user_id || !car_id || !start_date || !end_date) {
    console.warn('createBooking missing fields:', { user_id, car_id, start_date, end_date });
    return res.status(400).json({ message: 'All fields required' });
  }

  try {
    const [carResults] = await db.query('SELECT * FROM cars WHERE id = ? AND availability = 1', [car_id]);
    if (carResults.length === 0) return res.status(400).json({ message: 'Car not available' });

    const overlapQuery = `
      SELECT * FROM bookings WHERE car_id = ? AND
      (start_date < ? AND end_date > ?)
    `;
    const [overlapResults] = await db.query(overlapQuery, [car_id, end_date, start_date]);
    if (overlapResults.length > 0) {
      return res.status(400).json({ message: 'Car already booked for these dates' });
    }

    const [result] = await db.query(
      'INSERT INTO bookings (user_id, car_id, start_date, end_date, total_price, status) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, car_id, start_date, end_date, total_price || 0, 'pending']
    );
    
    // Automatically mark car as unavailable when booked
    await db.query('UPDATE cars SET availability = 0 WHERE id = ?', [car_id]);
    
    res.status(201).json({ message: 'Booking created', bookingId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'DB error', error: err.message });
  }
};

exports.getBookings = async (req, res) => {
  const sql = `
    SELECT b.id, u.name AS user, c.model AS car, b.start_date, b.end_date, b.total_price, b.status
    FROM bookings b
    LEFT JOIN users u ON b.user_id = u.id
    LEFT JOIN cars c ON b.car_id = c.id
    ORDER BY b.created_at DESC
  `;
  try {
    const [results] = await db.query(sql);
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'DB error', error: err.message });
  }
};

exports.getUserBookings = async (req, res) => {
  const { user_id } = req.params;
  const sql = `
    SELECT b.id, c.model AS car, c.type, b.start_date, b.end_date, b.total_price, b.status, b.payment_status
    FROM bookings b
    LEFT JOIN cars c ON b.car_id = c.id
    WHERE b.user_id = ?
    ORDER BY b.created_at DESC
  `;
  try {
    const [results] = await db.query(sql, [user_id]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'DB error', error: err.message });
  }
};

exports.updateBooking = async (req, res) => {
  const { id } = req.params;
  const { start_date, end_date } = req.body;
  
  if (!id || isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });
  if (!start_date || !end_date) return res.status(400).json({ message: 'Start and end dates required' });

  const overlapQuery = `
    SELECT * FROM bookings 
    WHERE id != ? AND car_id = (SELECT car_id FROM bookings WHERE id = ?) AND
    (start_date < ? AND end_date > ?)
  `;
  
  try {
    const [overlapResults] = await db.query(overlapQuery, [id, id, end_date, start_date]);
    if (overlapResults.length > 0) {
      return res.status(400).json({ message: 'Car already booked for these dates' });
    }

    const [result] = await db.query(
      'UPDATE bookings SET start_date = ?, end_date = ? WHERE id = ?',
      [start_date, end_date, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Booking not found' });
    res.json({ message: 'Booking updated' });
  } catch (err) {
    res.status(500).json({ message: 'DB error', error: err.message });
  }
};

exports.checkAvailability = async (req, res) => {
  const { car_id, start_date, end_date } = req.body;
  
  if (!car_id || !start_date || !end_date) {
    return res.status(400).json({ message: 'car_id, start_date, and end_date required', available: false });
  }

  try {
    // Check if car exists and is available
    const [carResults] = await db.query('SELECT * FROM cars WHERE id = ? AND availability = 1', [car_id]);
    if (carResults.length === 0) {
      return res.json({ available: false, message: 'Car not available' });
    }

    // Check for overlapping bookings
    const overlapQuery = `
      SELECT * FROM bookings WHERE car_id = ? AND
      (start_date < ? AND end_date > ?)
    `;
    const [overlapResults] = await db.query(overlapQuery, [car_id, end_date, start_date]);
    
    if (overlapResults.length > 0) {
      return res.json({ available: false, message: 'Car already booked for these dates' });
    }

    res.json({ available: true, message: 'Car is available for booking' });
  } catch (err) {
    res.status(500).json({ available: false, message: 'DB error', error: err.message });
  }
};

exports.deleteBooking = async (req, res) => {
  const { id } = req.params;
  if (!id || isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

  try {
    const [rows] = await db.query('SELECT * FROM bookings WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Booking not found' });
    const booking = rows[0];

    // If payment_status is 'paid' (admin already transacted), disallow deletion
    if (booking.payment_status && booking.payment_status === 'paid') {
      return res.status(400).json({ message: 'Cannot delete booking after payment/transaction' });
    }

    // If verifyToken set req.user, ensure the requester owns the booking
    if (req.user && Number(req.user.id) !== Number(booking.user_id)) {
      return res.status(403).json({ message: 'Not allowed to delete this booking' });
    }

    const [result] = await db.query('DELETE FROM bookings WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Booking not found' });
    
    // Automatically mark car as available again when booking is cancelled
    await db.query('UPDATE cars SET availability = 1 WHERE id = ?', [booking.car_id]);
    
    res.json({ message: 'Booking deleted' });
  } catch (err) {
    res.status(500).json({ message: 'DB error', error: err.message });
  }
};