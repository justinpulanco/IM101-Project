require('dotenv').config();
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect((err) => {
  if (err) {
    console.error('Connection failed:', err);
    process.exit(1);
  }
  console.log('Connected to database');

  // Insert sample cars
  const sampleCars = [
    ['Toyota Vios', 'Sedan', 500, 1],
    ['Honda CR-V', 'SUV', 800, 1],
    ['Mitsubishi Xpander', 'MPV', 700, 1],
    ['Nissan Almera', 'Sedan', 450, 1],
    ['Hyundai Accent', 'Sedan', 400, 1],
    ['Ford Ranger', 'Pickup', 1200, 1],
    ['Honda Civic', 'Sedan', 600, 1],
    ['Mazda 3', 'Sedan', 650, 1],
    ['Nissan Skyline GT-R R34', 'Sports', 2000, 1],
    ['Toyota Supra Mk4', 'Sports', 1800, 1],
    ['Honda Civic EG', 'Hatchback', 1200, 1],
    ['Dodge Charger', 'Muscle', 2500, 1],
    ['Chevrolet Camaro', 'Muscle', 2200, 1],
    ['Nissan Silvia S15', 'Sports', 1500, 1],
    ['Nissan 350Z', 'Sports', 1600, 1],
    ['Dodge Challenger SRT8', 'Muscle', 1900, 1],
    ['Mazda RX-7 FD', 'Sports', 1400, 1],
    ['Mitsubishi Eclipse', 'Coupe', 900, 1],
  ];

  const insertCarSql = 'INSERT IGNORE INTO cars (model, type, price_per_day, availability) VALUES ?';
  
  connection.query(insertCarSql, [sampleCars], (err) => {
    if (err) {
      console.error('Error inserting cars:', err);
    } else {
      console.log('Sample cars inserted successfully');
    }
    
    // Check how many cars exist
    connection.query('SELECT * FROM cars', (err, results) => {
      if (err) {
        console.error('Error checking cars:', err);
      } else {
        console.log(`Total cars in database: ${results.length}`);
        console.log('Cars:', results);
      }
      connection.end();
    });
  });
});

