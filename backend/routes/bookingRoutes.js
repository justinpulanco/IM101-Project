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

router.route('/:id')
  .delete(deleteBooking)
  .put(verifyToken, updateBooking);

module.exports = router;