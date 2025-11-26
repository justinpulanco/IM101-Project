const db = require('../config/db');

exports.getAllCars = async (req, res) => {
    try {
        const sql = 'SELECT * FROM cars WHERE is_available = true';
        const [results] = await db.query(sql);
        res.json(results);
    } catch (err) {
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
    const { model, brand, make, year, price_per_day, is_available, type, transmission, image } = req.body;
    const carBrand = brand || make; // Accept both brand and make
    
    if (!model || !carBrand || !year || !price_per_day) 
        return res.status(400).json({ message: 'Missing fields' });

    try {
        const sql = 'INSERT INTO cars (model, brand, year, price_per_day, is_available, type, transmission, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        const [result] = await db.query(sql, [
            model, 
            carBrand, 
            year, 
            price_per_day, 
            is_available ?? true,
            type || 'Sedan',
            transmission || 'Automatic',
            image || null
        ]);
        res.status(201).json({ message: 'Car added', carId: result.insertId });
    } catch (err) {
        res.status(500).json({ message: 'Error adding car', error: err.message });
    }
};

exports.updateCar = async (req, res) => {
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