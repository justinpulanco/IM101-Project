const db = require('../config/db');

exports.createPayment = async (req, res) => {
    const { booking_id, amount, payment_method } = req.body;
    
    if (!booking_id || !amount || !payment_method) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const [results] = await db.query('SELECT * FROM bookings WHERE id = ?', [booking_id]);
        if (results.length === 0) return res.status(404).json({ message: 'Booking not found' });
        
        const sql = 'INSERT INTO payments (booking_id, amount, payment_method, status) VALUES (?, ?, ?, ?)';
        const [result] = await db.query(sql, [booking_id, amount, payment_method, 'completed']);
        
        await db.query('UPDATE bookings SET payment_status = ? WHERE id = ?', ['paid', booking_id]);
        
        res.status(201).json({ 
            message: 'Payment processed successfully',
            paymentId: result.insertId
        });
    } catch (err) {
        res.status(500).json({ message: 'Error processing payment', error: err.message });
    }
};

exports.getPaymentsByBooking = async (req, res) => {
    const { booking_id } = req.params;
    
    const sql = `
        SELECT p.*, b.start_date, b.end_date, u.name as user_name
        FROM payments p
        JOIN bookings b ON p.booking_id = b.id
        JOIN users u ON b.user_id = u.id
        WHERE p.booking_id = ?
    `;
    
    try {
        const [results] = await db.query(sql, [booking_id]);
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching payments', error: err.message });
    }
};

exports.getPaymentById = async (req, res) => {
    const { id } = req.params;
    
    const sql = `
        SELECT p.*, b.start_date, b.end_date, u.name as user_name
        FROM payments p
        JOIN bookings b ON p.booking_id = b.id
        JOIN users u ON b.user_id = u.id
        WHERE p.id = ?
    `;
    
    try {
        const [results] = await db.query(sql, [id]);
        if (results.length === 0) return res.status(404).json({ message: 'Payment not found' });
        res.json(results[0]);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching payment', error: err.message });
    }
};
