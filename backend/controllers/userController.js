const User = require('../models/User');
const bcrypt = require('bcryptjs');

const userController = {
  getAllUsers: (req, res) => {
    User.getAllUsers((err, result) => {
      if (err) return res.status(500).json({ message: 'Error fetching users', error: err });
      res.json(result);
    });
  },

  getUserById: (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid user ID' });

    User.getUserById(id, (err, result) => {
      if (err) return res.status(500).json({ message: 'Error fetching user', error: err });
      if (!result || result.length === 0) return res.status(404).json({ message: 'User not found' });
      res.json(result[0]);
    });
  },

  createUser: async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields are required' });

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      User.createUser(name, email, hashedPassword, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error creating user', error: err });
        res.status(201).json({ message: 'User created', userId: result.insertId });
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  }
};

module.exports = userController;