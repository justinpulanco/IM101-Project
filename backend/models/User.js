const db = require('../config/db');

const User = {
  getAllUsers: async (callback) => {
    try {
      const [results] = await db.query('SELECT * FROM users');
      callback(null, results);
    } catch (err) {
      callback(err, null);
    }
  },
  getUserById: async (id, callback) => {
    try {
      const [results] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
      callback(null, results);
    } catch (err) {
      callback(err, null);
    }
  },
  createUser: async (name, email, password, callback) => {
    try {
      const [result] = await db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, password]);
      callback(null, result);
    } catch (err) {
      callback(err, null);
    }
  }
};

module.exports = User;