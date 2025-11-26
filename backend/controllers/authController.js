const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.register = async (req, res) => {
 const { name, email, password } = req.body;
 if (!name || !email || !password)
 return res.status(400).json({ message: 'All fields required' });
 if (!email.includes('@')) return res.status(400).json({ message: 'Invalid email' });
 if (password.length < 6) return res.status(400).json({ message: 'Password too short' });

 try {
 const [result] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
 if (result.length > 0) return res.status(400).json({ message: 'Email exists' });

    if (!bcrypt) {
        console.error("BCRYPT MODULE NOT LOADED");
        return res.status(500).json({ message: 'Server setup error: bcrypt not available' });
    }
    
 const hashed = await bcrypt.hash(password, 10);
 await db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashed]);
 res.status(201).json({ message: 'User registered' });

 } catch (error) {
 console.error("REGISTRATION CATCH ERROR:", error); 
 res.status(500).json({ message: 'Server error during registration', error: error.sqlMessage || error.message });
 }
};

exports.login = async (req, res) => {
 const { email, password } = req.body;
 if (!email || !password) return res.status(400).json({ message: 'All fields required' });

 try {
 const [results] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
 if (results.length === 0) return res.status(404).json({ message: 'User not found' });

 const user = results[0];

 if (!user || !user.password) {
 console.error("LOGIN ERROR: User data incomplete or missing password hash.");
 return res.status(401).json({ message: 'User not found or password invalid' }); 
 }

 const valid = await bcrypt.compare(password, user.password);
 if (!valid) return res.status(401).json({ message: 'Wrong password' });

 if (!process.env.JWT_SECRET) {
 console.error("JWT_SECRET is not defined in environment variables. Check .env file.");
 return res.status(500).json({ message: 'Server configuration error: Missing JWT secret' });
 }
 
 const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
 res.json({ message: 'Login successful', token, user: { id: user.id, name: user.name, email: user.email } });

 } catch (error) {
 console.error("LOGIN CATCH ERROR:", error);
 res.status(500).json({ message: 'Server error during login', error: error.message || 'Check JWT Secret and Database' });
 }
};

exports.getAllUsers = async (req, res) => {
 try {
 const [results] = await db.query('SELECT id, name, email, created_at FROM users');
 res.json(results);
 } catch (err) {
 console.error("GET ALL USERS DB ERROR:", err);
 res.status(500).json({ message: 'DB error', error: err.message });
 }
};

exports.deleteUserById = async (req, res) => {
 const id = parseInt(req.params.id);
 if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

 try {
  const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
 if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found' });
 res.json({ message: 'User deleted' });
 } catch (err) {
 console.error("DELETE USER DB ERROR:", err);
 res.status(500).json({ message: 'DB error', error: err.message });
 }
};