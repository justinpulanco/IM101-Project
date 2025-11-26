require('dotenv').config();  

const mysql = require('mysql2');

const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`Error: ${envVar} environment variable is required`);
        process.exit(1);
    }
}

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectTimeout: 10000
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        process.exit(1);
    }
    console.log('Connected to the database.');
});

setInterval(() => {
    db.ping((err) => {
        if (err) console.error('Database ping failed:', err);
    });
}, 60000);

const checkBookingOverlap = (carId, startDate, endDate, callback) => {
    const query = `
        SELECT * FROM bookings WHERE car_id = ? AND
        (start_date < ? AND end_date > ?)
    `;
    db.execute(query, [carId, endDate, startDate], (err, results) => {
        if (err) {
            return callback('DB error: ' + err); 
        }
        if (results.length > 0) {
            return callback(null, 'Car already booked'); 
        }
        return callback(null, 'Booking available'); 
    });
};

module.exports = { db, checkBookingOverlap };