require('dotenv').config();
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectTimeout: 10000
});

const queryAsync = (query, params) => {
    return new Promise((resolve, reject) => {
        db.query(query, params, (err, results) => {
            if (err) reject(err);
            resolve(results);
        });
    });
};

async function testRegistration() {
    try {
        console.log('Testing registration process...');
        
        const name = 'Test User';
        const email = 'test@example.com';
        const password = 'password123';
        
        console.log('1. Checking if email exists...');
        const result = await queryAsync('SELECT * FROM users WHERE email = ?', [email]);
        if (result.length > 0) {
            console.log('Email already exists');
            return;
        }
        console.log('✅ Email check passed');
        
        console.log('2. Testing bcrypt availability...');
        if (!bcrypt) {
            console.error('BCRYPT MODULE NOT LOADED');
            return;
        }
        console.log('✅ bcrypt is available');
        
        console.log('3. Hashing password...');
        const hashed = await bcrypt.hash(password, 10);
        console.log('✅ Password hashed successfully');
        
        console.log('4. Inserting user...');
        await queryAsync('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashed]);
        console.log('✅ User inserted successfully');
        
        console.log('🎉 Registration test completed successfully!');
        
    } catch (error) {
        console.error('❌ Registration test failed:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            errno: error.errno,
            sqlMessage: error.sqlMessage,
            sql: error.sql
        });
    } finally {
        db.end();
    }
}

testRegistration();
