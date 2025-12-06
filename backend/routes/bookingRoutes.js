const express = require('express');
const router = express.Router();
const { createBooking, getBookings, deleteBooking, updateBooking, getUserBookings, checkAvailability } = require('../controllers/bookingController');
const { checkBookingOverlap } = require('../config/db'); 
const { verifyToken } = require('../middleware/authMiddleware');

router.route('/')
  .post(async (req, res) => {
    try {
      console.log('POST /api/bookings received from', req.ip || req.connection.remoteAddress);
      console.log('Request body:', req.body);
      const { car_id, start_date, end_date } = req.body;
      const message = await checkBookingOverlap(car_id, start_date, end_date);
      if (message === 'Car already booked') {
        return res.status(400).json({ message: 'Car is already booked for these dates' });
      }
      // delegate to controller
      return createBooking(req, res);
    } catch (err) {
      console.error('Error in booking route:', err);
      return res.status(500).json({ message: 'DB error', error: err.message || err });
    }
  })
  .get(getBookings);

router.get('/user/:user_id', getUserBookings);

router.post('/check-availability', checkAvailability);

// Update booking status (confirm/cancel) - MUST BE BEFORE /:id route
router.put('/:id/status', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  
  try {
    const db = require('../config/db');
    
    // Get booking details first
    const [bookings] = await db.query('SELECT * FROM bookings WHERE id = ?', [id]);
    if (bookings.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    const booking = bookings[0];
    
    // Update booking status
    await db.query('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);
    
    // If confirming booking, mark car as unavailable
    if (status === 'confirmed') {
      await db.query('UPDATE cars SET availability = 0 WHERE id = ?', [booking.car_id]);
    }
    
    // If cancelling booking, mark car as available
    if (status === 'cancelled') {
      await db.query('UPDATE cars SET availability = 1 WHERE id = ?', [booking.car_id]);
    }
    
    res.json({ message: 'Booking status updated', status });
  } catch (err) {
    res.status(500).json({ message: 'DB error', error: err.message });
  }
});

router.route('/:id')
  .delete(deleteBooking)
  .put(verifyToken, updateBooking);

module.exports = router;
