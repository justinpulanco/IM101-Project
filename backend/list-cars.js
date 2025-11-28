const db = require('./config/db');

async function listCars() {
  try {
    const [cars] = await db.query('SELECT id, model, type FROM cars ORDER BY model');
    console.log('Total cars:', cars.length);
    console.log('\nCars in DB:');
    cars.forEach((c, idx) => {
      console.log(`${idx + 1}. [ID:${c.id}] ${c.model} (${c.type})`);
    });
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

listCars();
