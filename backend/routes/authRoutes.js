const express = require('express');
const router = express.Router();
const { register, login, getAllUsers, deleteUserById } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', (req, res) => res.send('✅ Auth route working!'));
router.post('/register', register); 
router.post('/login', login);
router.get('/users', verifyToken, getAllUsers);
router.delete('/users/:id', verifyToken, deleteUserById);

module.exports = router;