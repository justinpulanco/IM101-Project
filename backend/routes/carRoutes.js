const express = require('express');
const router = express.Router();
const db = require('../config/db'); 

router.get('/', (req, res) => {
  console.log('📡 GET /api/cars hit!');


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

router.get('/test', (req, res) => {
  res.json({ message: 'Car routes working fine!' });
});

module.exports = router;
