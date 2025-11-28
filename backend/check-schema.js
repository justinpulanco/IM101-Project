const db = require('./config/db');

async function checkSchema() {
  try {
    const [cols] = await db.query("DESCRIBE bookings");
    console.log('Bookings table columns:');
    cols.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkSchema();
