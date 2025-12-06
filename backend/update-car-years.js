require('dotenv').config({ path: './backend/.env' });
const db = require('./config/db');

async function updateCarYears() {
  try {
    console.log('Updating car models and years...\n');
    
    const updates = [
      { oldModel: 'Hyundai Grand Starex - 2016 model', newModel: 'Hyundai Grand Starex', year: 2016 },
      { oldModel: 'Tonery Tiggo 2 - 2024 model', newModel: 'Tonery Tiggo 2', year: 2024 },
      { oldModel: 'Toyota Fortuner - 2016 model', newModel: 'Toyota Fortuner', year: 2016 },
      { oldModel: 'Toyota HiAce - 2016 model', newModel: 'Toyota HiAce', year: 2016 },
      { oldModel: 'Toyota Hilux - 2017 model', newModel: 'Toyota Hilux', year: 2017 },
      { oldModel: 'Toyota Scion xB - 2004 model', newModel: 'Toyota Scion xB', year: 2004 },
      { oldModel: 'Kia Picanto - 2003 model', newModel: 'Kia Picanto', year: 2003 },
      { oldModel: 'Toyota Vios', newModel: 'Toyota Vios', year: 2020 },
      { oldModel: 'Honda CR-V', newModel: 'Honda CR-V', year: 2019 },
      { oldModel: 'Nissan Almera', newModel: 'Nissan Almera', year: 2018 },
      { oldModel: 'Mitsubishi Xpander', newModel: 'Mitsubishi Xpander', year: 2020 },
      { oldModel: 'Ford Ranger', newModel: 'Ford Ranger', year: 2018 },
      { oldModel: 'Hyundai Accent', newModel: 'Hyundai Accent', year: 2017 }
    ];
    
    for (const update of updates) {
      const [result] = await db.query(
        'UPDATE cars SET model = ?, year = ? WHERE model = ?',
        [update.newModel, update.year, update.oldModel]
      );
      
      if (result.affectedRows > 0) {
        console.log(`✓ Updated: ${update.newModel} (${update.year})`);
      }
    }
    
    console.log('\n✅ All cars updated successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

updateCarYears();
