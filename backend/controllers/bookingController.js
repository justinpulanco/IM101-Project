const db = require('../config/db');

exports.createBooking = (req, res) => {
  const { user_id, car_id, start_date, end_date, total_price } = req.body;
  if (!user_id || !car_id || !start_date || !end_date)
    return res.status(400).json({ message: 'All fields required' });

  // Check if car is available
  db.query('SELECT * FROM cars WHERE id = ? AND is_available = true', [car_id], (err, results) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err });
    if (results.length === 0) return res.status(400).json({ message: 'Car not available' });

    // Check if the car is already booked for the selected dates
    const overlapQuery = `
      SELECT * FROM bookings WHERE car_id = ? AND
      (start_date < ? AND end_date > ?)
    `;
    db.query(overlapQuery, [car_id, end_date, start_date], (err, overlapResults) => {
      if (err) return res.status(500).json({ message: 'DB error', error: err });
      if (overlapResults.length > 0) {
        return res.status(400).json({ message: 'Car already booked for these dates' });
      }

      // Create booking if no overlap
      db.query(
        'INSERT INTO bookings (user_id, car_id, start_date, end_date, total_price) VALUES (?, ?, ?, ?, ?)',
        [user_id, car_id, start_date, end_date, total_price || 0],
        (err, result) => {
          if (err) return res.status(500).json({ message: 'DB error', error: err });
          res.status(201).json({ message: 'Booking created', bookingId: result.insertId });
        }
      );
    });
  });
};

exports.getBookings = (req, res) => {
  const sql = `
    SELECT b.id, u.name AS user, c.model AS car, b.start_date, b.end_date, b.total_price
    FROM bookings b
    LEFT JOIN users u ON b.user_id = u.id
    LEFT JOIN cars c ON b.car_id = c.id
    ORDER BY b.created_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err });
    res.json(results);
  });
};

exports.deleteBooking = (req, res) => {
  const { id } = req.params;
  if (!id || isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

  db.query('DELETE FROM bookings WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Booking not found' });
    res.json({ message: 'Booking deleted' });
  });
};