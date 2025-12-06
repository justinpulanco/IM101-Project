require('dotenv').config({ path: './backend/.env' });
const db = require('./config/db');

async function addMakeColumn() {
  try {
    console.log('Adding make (brand) column to cars table...');
    
    // Check if column already exists
    const [columns] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'cars' 
      AND COLUMN_NAME = 'make'
    `);
    
    if (columns.length > 0) {
      console.log('✓ Make column already exists');
    } else {
      // Add make column
      await db.query(`
        ALTER TABLE cars 
        ADD COLUMN make VARCHAR(50) NULL AFTER model
      `);
      console.log('✓ Make column added successfully');
    }
    
    // Update car makes
    console.log('\nUpdating car makes...');
    
    const updates = [
      { model: 'Hyundai Grand Starex', make: 'Hyundai' },
      { model: 'Hyundai Accent', make: 'Hyundai' },
      { model: 'Tonery Tiggo 2', make: 'Tiggo' },
      { model: 'Toyota Fortuner', make: 'Toyota' },
      { model: 'Toyota HiAce', make: 'Toyota' },
      { model: 'Toyota Hilux', make: 'Toyota' },
      { model: 'Toyota Scion xB', make: 'Toyota' },
      { model: 'Toyota Vios', make: 'Toyota' },
      { model: 'Kia Picanto', make: 'Kia' },
      { model: 'Honda CR-V', make: 'Honda' },
      { model: 'Nissan Almera', make: 'Nissan' },
      { model: 'Mitsubishi Xpander', make: 'Mitsubishi' },
      { model: 'Ford Ranger', make: 'Ford' }
    ];
    
    for (const update of updates) {
      const [result] = await db.query(
        'UPDATE cars SET make = ? WHERE model = ?',
        [update.make, update.model]
      );
      
      if (result.affectedRows > 0) {
        console.log(`✓ ${update.make} ${update.model}`);
      }
    }
    
    console.log('\n✅ All car makes updated successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

addMakeColumn();
