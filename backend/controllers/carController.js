const db = require('../config/db');

exports.getAllCars = async (req, res) => {
    try {
        const sql = 'SELECT * FROM cars';
        const [results] = await db.query(sql);
        console.log('Cars retrieved:', results.length);
        res.json(results);
    } catch (err) {
        console.error('Error fetching cars:', err);
        res.status(500).json({ message: 'Error fetching cars', error: err.message });
    }
};

exports.getCarById = async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    try {
        const [results] = await db.query('SELECT * FROM cars WHERE id = ?', [id]);
        if (results.length === 0) return res.status(404).json({ message: 'Car not found' });
        res.json(results[0]);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching car', error: err.message });
    }
};

exports.addCar = async (req, res) => {
    const { model, type, price_per_day, availability } = req.body;
    
    if (!model || !type || !price_per_day) 
        return res.status(400).json({ message: 'Missing required fields: model, type, price_per_day' });

    try {
        const sql = 'INSERT INTO cars (model, type, price_per_day, availability) VALUES (?, ?, ?, ?)';
        const [result] = await db.query(sql, [
            model, 
            type, 
            price_per_day, 
            availability ?? 1
        ]);
        res.status(201).json({ message: 'Car added', carId: result.insertId });
    } catch (err) {
        res.status(500).json({ message: 'Error adding car', error: err.message });
    }
};

exports.updateCar = async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    const { model, type, price_per_day, availability } = req.body;
    const updates = [], values = [];

    if (model) { updates.push('model = ?'); values.push(model); }
    if (type) { updates.push('type = ?'); values.push(type); }
    if (price_per_day) { updates.push('price_per_day = ?'); values.push(price_per_day); }
    if (availability !== undefined) { updates.push('availability = ?'); values.push(availability); }

    if (updates.length === 0) return res.status(400).json({ message: 'No fields to update' });

    try {
        values.push(id);
        const [result] = await db.query(`UPDATE cars SET ${updates.join(', ')} WHERE id = ?`, values);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Car not found' });
        res.json({ message: 'Car updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating car', error: err.message });
    }
};

exports.deleteCar = async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    try {
        const [result] = await db.query('DELETE FROM cars WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Car not found' });
        res.json({ message: 'Car deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting car', error: err.message });
    }
};