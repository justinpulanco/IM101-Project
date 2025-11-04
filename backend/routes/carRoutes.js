const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Import MySQL connection

// ✅ Route: Get all cars
router.get('/', (req, res) => {
  console.log('📡 GET /api/cars hit!');

  // Check if DB connection exists
  if (!db) {
    console.error('❌ Database connection not found!');
    return res.status(500).json({ message: 'Database not connected' });
  }

  const query = 'SELECT * FROM cars';

  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Error fetching cars:', err.message);
      return res.status(500).json({ message: 'Error fetching cars from database', error: err.message });
    }

    console.log(`✅ Fetched ${results.length} cars from database`);
    res.status(200).json(results);
  });
});

// ✅ Health check route (for debugging)
router.get('/test', (req, res) => {
  res.json({ message: 'Car routes working fine!' });
});

module.exports = router;
