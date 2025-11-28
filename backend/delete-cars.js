const db = require('./config/db');

async function deleteSpecificCars() {
  try {
    const toDelete = [23, 24, 28]; // Honda Civic, Mazda 3, Dodge Charger
    console.log('Deleting cars:', toDelete);

    for (const id of toDelete) {
      await db.query('DELETE FROM bookings WHERE car_id = ?', [id]);
      await db.query('DELETE FROM cars WHERE id = ?', [id]);
      console.log(`✓ Deleted car ID ${id}`);
    }

    console.log('Done!');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

deleteSpecificCars();
