const express = require('express');
const router = express.Router();
const { getAllCars, getCarById, addCar, updateCar, deleteCar } = require('../controllers/carController');

router.get('/', getAllCars);
router.get('/:id', getCarById);
router.post('/', addCar);
router.put('/:id', updateCar);
router.delete('/:id', deleteCar);

module.exports = router;
