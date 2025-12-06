const express = require('express');
const router = express.Router();
const availabilityController = require('../controllers/availabilityController');

// Update all car availability based on current bookings
router.post('/update', availabilityController.updateCarAvailability);

// Check if a specific car is available for given dates
router.post('/check', availabilityController.checkCarAvailability);

// Manually trigger expired bookings check
router.post('/check-expired', availabilityController.checkExpiredBookings);

module.exports = router;
