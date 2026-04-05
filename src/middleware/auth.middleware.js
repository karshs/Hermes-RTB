const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const protect = async (req, res, next) => {
    try {
        // 1. Check if token exists in headers
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided. Access denied.'
            });
        }

        // 2. Extract token (remove "Bearer " prefix)
        const token = authHeader.split(' ')[1];

        // 3. Verify token is real and not expired
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Find the user from database
        const result = await pool.query(
            'SELECT id, username, email, balance FROM users WHERE id = $1',
            [decoded.id]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'User no longer exists.'
            });
        }

        // 5. Attach user to request object
        req.user = result.rows[0];

        // 6. Move to next function
        next();

    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token.'
        });
    }
};



module.exports = { protect };