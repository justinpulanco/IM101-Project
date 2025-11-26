require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectTimeout: 10000
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
    console.log('✅ Database connected successfully!');
    
    db.query('DESCRIBE users', (err, results) => {
        if (err) {
            console.error('Error describing users table:', err);
        } else {
            console.log('Users table structure:');
            console.table(results);
        }
        
        db.query('SELECT COUNT(*) as count FROM users', (err, results) => {
            if (err) {
                console.error('Error counting users:', err);
            } else {
                console.log(`\nTotal users in database: ${results[0].count}`);
            }
            db.end();
        });
    });
});
