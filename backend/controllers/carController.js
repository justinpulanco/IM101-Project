const db = require('../config/db');

exports.getAllCars = (req, res) => {
    const sql = 'SELECT * FROM cars WHERE is_available = true';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: 'Error fetching cars', error: err });
        res.json(results);
    });
};

exports.getCarById = (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    db.query('SELECT * FROM cars WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Error fetching car', error: err });
        if (results.length === 0) return res.status(404).json({ message: 'Car not found' });
        res.json(results[0]);
    });
};

exports.addCar = (req, res) => {
    const { model, brand, year, price_per_day, is_available } = req.body;
    if (!model || !brand || !year || !price_per_day) return res.status(400).json({ message: 'Missing fields' });

    const sql = 'INSERT INTO cars (model, brand, year, price_per_day, is_available) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [model, brand, year, price_per_day, is_available ?? true], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error adding car', error: err });
        res.status(201).json({ message: 'Car added', carId: result.insertId });
    });
};

exports.updateCar = (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    const { model, brand, year, price_per_day, is_available } = req.body;
    const updates = [], values = [];

    if (model) { updates.push('model = ?'); values.push(model); }
    if (brand) { updates.push('brand = ?'); values.push(brand); }
    if (year) { updates.push('year = ?'); values.push(year); }
    if (price_per_day) { updates.push('price_per_day = ?'); values.push(price_per_day); }
    if (is_available !== undefined) { updates.push('is_available = ?'); values.push(is_available); }

    if (updates.length === 0) return res.status(400).json({ message: 'No fields to update' });

    values.push(id);
    db.query(`UPDATE cars SET ${updates.join(', ')} WHERE id = ?`, values, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error updating car', error: err });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Car not found' });
        res.json({ message: 'Car updated successfully' });
    });
};

exports.deleteCar = (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    db.query('DELETE FROM cars WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error deleting car', error: err });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Car not found' });
        res.json({ message: 'Car deleted successfully' });
    });
};