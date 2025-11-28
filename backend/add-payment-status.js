const db = require('./config/db');

async function addPaymentStatusColumn() {
  try {
    console.log('Adding payment_status column to bookings table...');
    await db.query(`ALTER TABLE bookings ADD COLUMN payment_status VARCHAR(50) DEFAULT 'pending'`);
    console.log('✓ Column added successfully');
    process.exit(0);
  } catch (err) {
    if (err.message.includes('Duplicate column')) {
      console.log('Column already exists');
      process.exit(0);
    }
    console.error('Error:', err.message);
    process.exit(1);
  }
}

addPaymentStatusColumn();
