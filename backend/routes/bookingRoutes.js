const express = require('express');
const router = express.Router();
const { createBooking, getBookings, deleteBooking } = require('../controllers/bookingController');
const { checkBookingOverlap } = require('../config/db'); // Import the overlap check

// Create booking route
router.route('/')
  .post(async (req, res) => {
    const { car_id, start_date, end_date } = req.body;
    
    // Check if the car is already booked for the selected dates
    checkBookingOverlap(car_id, start_date, end_date, (err, message) => {
      if (err) return res.status(500).json({ message: 'DB error', error: err });
      if (message === 'Car already booked') {
        return res.status(400).json({ message: 'Car is already booked for these dates' });
      }
      
      // Proceed to create booking if no overlap
      createBooking(req, res);  // Call the original createBooking function
    });
  })
  .get(getBookings); // Get all bookings

// Delete booking by ID
router.route('/:id')
  .delete(deleteBooking);

module.exports = router;