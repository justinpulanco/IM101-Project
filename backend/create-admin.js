require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./config/db');

const adminEmail = process.argv[2] || 'admin@carrentals.com';
const adminPassword = process.argv[3] || 'Admin@123';
const adminName = process.argv[4] || 'Admin User';

console.log(`Creating admin account with:\n  Email: ${adminEmail}\n  Password: ${adminPassword}\n  Name: ${adminName}\n`);

const hashPassword = async () => {
  try {
    const hashed = await bcrypt.hash(adminPassword, 10);
    
    // Check if admin already exists
    db.query('SELECT * FROM users WHERE email = ?', [adminEmail], (err, results) => {
      if (err) {
        console.error('Error checking email:', err);
        process.exit(1);
      }
      
      if (results.length > 0) {
        console.error('❌ Admin account already exists with this email!');
        process.exit(1);
      }
      
      // Insert new admin user
      db.query(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [adminName, adminEmail, hashed],
        (err, result) => {
          if (err) {
            console.error('Error creating admin:', err);
            process.exit(1);
          }
          
          console.log(`✅ Admin account created successfully!`);
          console.log(`   ID: ${result.insertId}`);
          console.log(`   Email: ${adminEmail}`);
          console.log(`   Password: ${adminPassword}`);
          console.log(`\nYou can now login at http://localhost:3000 by clicking the ⚙️ icon`);
          process.exit(0);
        }
      );
    });
  } catch (err) {
    console.error('Error hashing password:', err);
    process.exit(1);
  }
};

hashPassword();
