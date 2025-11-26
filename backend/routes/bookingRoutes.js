const express = require('express');
const router = express.Router();
const { createBooking, getBookings, deleteBooking, updateBooking, getUserBookings } = require('../controllers/bookingController');
const { checkBookingOverlap } = require('../config/db'); 

router.route('/')
  .post(async (req, res) => {
    const { car_id, start_date, end_date } = req.body;
    
    checkBookingOverlap(car_id, start_date, end_date, (err, message) => {
      if (err) return res.status(500).json({ message: 'DB error', error: err });
      if (message === 'Car already booked') {
        return res.status(400).json({ message: 'Car is already booked for these dates' });
      }
      
      createBooking(req, res);  
    });
  })
  .get(getBookings); 

router.route('/:id')
  .delete(deleteBooking);

router.route('/:id')
  .put(updateBooking);

router.get('/user/:user_id', getUserBookings);

module.exports = router;