const db = require('./config/db');

async function cleanupDuplicateCars() {
  try {
    console.log('Starting duplicate car cleanup...');

    // Get all cars
    const [allCars] = await db.query('SELECT id, model FROM cars ORDER BY model, id');
    
    // Build a map of base model name (lowercase, remove year/variant) to list of IDs
    const modelMap = {};
    allCars.forEach((car) => {
      // Extract base model: remove leading year/numbers, get core name
      // e.g., "1995 Mitsubishi Eclipse" -> "mitsubishi eclipse"
      // e.g., "Mitsubishi Eclipse" -> "mitsubishi eclipse"
      const base = car.model.toLowerCase().replace(/^\d+\s+/, '').trim();
      if (!modelMap[base]) modelMap[base] = [];
      modelMap[base].push({ id: car.id, model: car.model });
    });

    console.log('\nModel groups:');
    let toDelete = [];
    for (const [base, entries] of Object.entries(modelMap)) {
      if (entries.length > 1) {
        console.log(`\n  "${base}" has ${entries.length} entries:`);
        entries.forEach((e, i) => {
          console.log(`    ${i}: ID ${e.id} - ${e.model}`);
        });
        // Keep the first (lowest ID), delete the rest
        const keptId = entries[0].id;
        entries.slice(1).forEach((e) => {
          toDelete.push(e.id);
          console.log(`    -> Will delete ID ${e.id}`);
        });
      }
    }

    if (toDelete.length === 0) {
      console.log('\nNo duplicates found.');
      process.exit(0);
    }

    console.log(`\n\nTotal to delete: ${toDelete.length} car(s)`);
    console.log('IDs:', toDelete);

    // Delete duplicates
    for (const id of toDelete) {
      await db.query('DELETE FROM bookings WHERE car_id = ?', [id]);
      await db.query('DELETE FROM cars WHERE id = ?', [id]);
      console.log(`✓ Deleted car ID ${id}`);
    }

    console.log('\nCleanup complete!');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

cleanupDuplicateCars();
