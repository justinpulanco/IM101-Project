const db = require('../config/db');

exports.createPayment = (req, res) => {
    const { booking_id, amount, payment_method } = req.body;
    
    if (!booking_id || !amount || !payment_method) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    db.query('SELECT * FROM bookings WHERE id = ?', [booking_id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Error verifying booking', error: err });
        if (results.length === 0) return res.status(404).json({ message: 'Booking not found' });
        const sql = 'INSERT INTO payments (booking_id, amount, payment_method, status) VALUES (?, ?, ?, ?)';
        db.query(sql, [booking_id, amount, payment_method, 'completed'], (err, result) => {
            if (err) return res.status(500).json({ message: 'Error processing payment', error: err });
            
            db.query('UPDATE bookings SET payment_status = ? WHERE id = ?', 
                ['paid', booking_id], 
                (err) => {
                    if (err) return res.status(500).json({ message: 'Error updating booking status', error: err });
                    res.status(201).json({ 
                        message: 'Payment processed successfully',
                        paymentId: result.insertId
                    });
                }
            );
        });
    });
};

exports.getPaymentsByBooking = (req, res) => {
    const { booking_id } = req.params;
    
    const sql = `
        SELECT p.*, b.start_date, b.end_date, u.name as user_name
        FROM payments p
        JOIN bookings b ON p.booking_id = b.id
        JOIN users u ON b.user_id = u.id
        WHERE p.booking_id = ?
    `;
    
    db.query(sql, [booking_id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Error fetching payments', error: err });
        res.json(results);
    });
};

exports.getPaymentById = (req, res) => {
    const { id } = req.params;
    
    const sql = `
        SELECT p.*, b.start_date, b.end_date, u.name as user_name
        FROM payments p
        JOIN bookings b ON p.booking_id = b.id
        JOIN users u ON b.user_id = u.id
        WHERE p.id = ?
    `;
    
    db.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Error fetching payment', error: err });
        if (results.length === 0) return res.status(404).json({ message: 'Payment not found' });
        res.json(results[0]);
    });
};
