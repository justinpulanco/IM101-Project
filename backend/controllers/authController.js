const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Utility to handle DB queries as promises
const queryAsync = (query, params) => {
  return new Promise((resolve, reject) => {
    db.query(query, params, (err, results) => {
      if (err) reject(err);
      resolve(results);
    });
  });
};

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'All fields required' });
  if (!email.includes('@')) return res.status(400).json({ message: 'Invalid email' });
  if (password.length < 6) return res.status(400).json({ message: 'Password too short' });

  try {
    const result = await queryAsync('SELECT * FROM users WHERE email = ?', [email]);
    if (result.length > 0) return res.status(400).json({ message: 'Email exists' });

    const hashed = await bcrypt.hash(password, 10);
    await queryAsync('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashed]);
    res.status(201).json({ message: 'User registered' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'All fields required' });

  try {
    const results = await queryAsync('SELECT * FROM users WHERE email = ?', [email]);
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });

    const user = results[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Wrong password' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token, user: { id: user.id, name: user.name, email: user.email } });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Admin / protected: get all users (without passwords)
exports.getAllUsers = async (req, res) => {
  try {
    const results = await queryAsync('SELECT id, name, email, created_at FROM users');
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'DB error', error: err });
  }
};

// Delete user by id
exports.deleteUserById = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

  try {
    const result = await queryAsync('DELETE FROM users WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'DB error', error: err });
  }
};