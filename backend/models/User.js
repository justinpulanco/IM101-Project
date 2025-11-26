const db = require('../config/db');

const User = {
  getAllUsers: (callback) => {
    db.execute('SELECT * FROM users', callback);
  },
  getUserById: (id, callback) => {
    db.execute('SELECT * FROM users WHERE id = ?', [id], callback);
  },
  createUser: (name, email, password, callback) => {
    db.execute('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, password], callback);
  }
};

module.exports = User;