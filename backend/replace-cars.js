require('dotenv').config({ path: './backend/.env' });
const db = require('./config/db');

async function replaceCars() {
  try {
    console.log('🚗 Replacing sports/muscle cars with practical vehicles...\n');
    
    // Cars to remove (sports/muscle cars)
    const carsToRemove = [
      '1967 Chevrolet Camaro',
      '1970 Dodge Charger R/T',
      '1993 Mazda RX-7 FD',
      '1995 Honda Civic EG',
      '1995 Mitsubishi Eclipse',
      '1995 Toyota Supra Mk4',
      '1999 Nissan Skyline GT-R R34',
      '2002 Nissan Silvia S15',
      '2006 Nissan 350Z',
      '2008 Dodge Challenger SRT8'
    ];
    
    // Remove old cars
    console.log('❌ Removing old cars...');
    for (const carModel of carsToRemove) {
      const [result] = await db.query('DELETE FROM cars WHERE model = ?', [carModel]);
      if (result.affectedRows > 0) {
        console.log(`   Removed: ${carModel}`);
      }
    }
    
    // New cars to add
    const newCars = [
      { model: 'Hyundai Grand Starex - 2016 model', type: 'Van', price: 2800 },
      { model: 'Tonery Tiggo 2 - 2024 model', type: 'SUV', price: 2200 },
      { model: 'Toyota Fortuner - 2016 model', type: 'SUV', price: 3200 },
      { model: 'Toyota HiAce - 2016 model', type: 'Van', price: 2900 },
      { model: 'Toyota Hilux - 2017 model', type: 'Pickup', price: 2800 },
      { model: 'Toyota Scion xB - 2004 model', type: 'Compact', price: 1800 },
      { model: 'Kia Picanto - 2003 model', type: 'Compact', price: 1200 }
    ];
    
    // Add new cars
    console.log('\n✅ Adding new cars...');
    for (const car of newCars) {
      const [result] = await db.query(
        'INSERT INTO cars (model, type, price_per_day, availability) VALUES (?, ?, ?, 1)',
        [car.model, car.type, car.price]
      );
      console.log(`   Added: ${car.model} - ₱${car.price}/day`);
    }
    
    console.log('\n🎉 Car replacement completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

replaceCars();
