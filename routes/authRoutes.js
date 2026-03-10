const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// Debug Endpoints
router.get('/debug-status', (req, res) => {
    res.json({ status: 'OK', message: 'Auth routes are accessible' });
});

router.post('/debug-body', (req, res) => {
    console.log('Debug body received:', req.body);
    res.json({ bodyReceived: !!req.body, keys: Object.keys(req.body || {}) });
});

// Register Route
router.post('/register', async (req, res) => {
    console.log('Registration request body:', req.body);
    const {
        cargo, full_name, cpf_cnpj, email, cep, address, house_number,
        complement, state, city, neighborhood, phone_residential,
        phone_mobile, gender, password
    } = req.body;

    if (!email || !password || !full_name || !cpf_cnpj) {
        console.warn('Registration failed: Mandatory fields missing', {
            email: !!email,
            password: !!password,
            full_name: !!full_name,
            cpf_cnpj: !!cpf_cnpj
        });
        return res.status(400).json({
            error: true,
            message: 'Invalid: Mandatory fields missing (email, password, full_name, cpf_cnpj)',
            data: {}
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.execute(
            `INSERT INTO users (
                cargo, full_name, cpf_cnpj, email, cep, address, house_number, 
                complement, state, city, neighborhood, phone_residential, 
                phone_mobile, gender, password
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                cargo || null, full_name, cpf_cnpj, email, cep || null, address || null,
                house_number || null, complement || null, state || null, city || null,
                neighborhood || null, phone_residential || null, phone_mobile || null,
                gender || null, hashedPassword
            ]
        );
        res.status(201).json({
            error: false,
            message: 'Success',
            data: { userId: result.insertId }
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.json({
                error: true,
                message: 'Invalid: Email already exists',
                data: {}
            });
        }
        console.error('Registration error:', error);
        res.status(500).json({
            error: true,
            message: 'Error',
            data: {}
        });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    try {
        console.log('Login attempt body:', req.body);
        const identifier = req.body?.email;
        const password = req.body?.password;

        if (!identifier || !password) {
            console.log('Missing identifier or password');
            return res.status(401).json({
                error: true,
                data: { email: identifier || '' },
                message: 'Invalid credentials'
            });
        }

        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [identifier]);
        console.log('DB rows found:', rows.length);
        const user = rows[0];

        if (!user) {
            console.log('User not found in DB');
            return res.status(401).json({
                error: true,
                data: { email: identifier },
                message: 'Invalid credentials'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', isMatch);

        if (!isMatch) {
            return res.status(401).json({
                error: true,
                data: { email: identifier },
                message: 'Invalid credentials'
            });
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email, full_name: user.full_name },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Store token in DB
        await db.execute(
            'INSERT INTO user_tokens (user_id, token) VALUES (?, ?)',
            [user.id, token]
        );

        res.json({
            error: false,
            data: {
                userId: user.id,
                token: token
            },
            message: 'Success'
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: true,
            data: {},
            message: 'Internal server error during login'
        });
    }
});

module.exports = router;
