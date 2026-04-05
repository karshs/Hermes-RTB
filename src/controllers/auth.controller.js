const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Helper: generate JWT token
const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
};

// POST /auth/register
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // 1. Check if user already exists
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1 OR username = $2',
            [email, username]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Username or email already taken'
            });
        }

        // 2. Hash the password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // 3. Insert user into database
        const result = await pool.query(
            `INSERT INTO users (username, email, password_hash) 
       VALUES ($1, $2, $3) 
       RETURNING id, username, email, balance, created_at`,
            [username, email, password_hash]
        );

        const user = result.rows[0];

        // 4. Generate token
        const token = generateToken(user.id);

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            token,
            user
        });

    } catch (err) {
        console.error('Register error:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// POST /auth/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find user by email
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const user = result.rows[0];

        // 2. Compare password with hash
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // 3. Generate token
        const token = generateToken(user.id);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                balance: user.balance
            }
        });

    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getMe = async (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
};

module.exports = { register, login, getMe };