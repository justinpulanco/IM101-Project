require('dotenv').config();
const mysql = require('mysql2');

console.log('Testing database connection...');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);

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
        console.error('Error code:', err.code);
        console.error('Error message:', err.message);
        process.exit(1);
    }
    console.log('✅ Database connected successfully!');
    
    db.query('SHOW TABLES', (err, results) => {
        if (err) {
            console.error('Error showing tables:', err);
        } else {
            console.log('Tables in database:', results);
        }
        db.end();
    });
});
