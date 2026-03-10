const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware to authenticate JWT token
 */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    let token = null;

    if (authHeader) {
        if (authHeader.toLowerCase().startsWith('bearer ')) {
            token = authHeader.substring(7).trim();
        } else {
            token = authHeader.trim();
        }

        // Remove quotes if present
        if (token.startsWith('"') && token.endsWith('"')) {
            token = token.substring(1, token.length - 1);
        }
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. No token provided.'
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('JWT Error in contactRoutes:', error.message);
        return res.status(403).json({
            success: false,
            message: 'Invalid token.'
        });
    }
};

// Contact Submission Route
router.post('/', authenticateToken, async (req, res) => {
    try {
        console.log('Contact submission body:', req.body);
        const { name, email, phone, subject, message } = req.body;
        const userId = req.user.userId;
        console.log(req.body)

        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: 'Mandatory fields missing (name, email, message)'
            });
        }

        const [result] = await db.execute(
            'INSERT INTO contacts (user_id, name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, name, email, phone || null, subject || null, message]
        );

        res.json({
            success: true,
            data: { id: result.insertId },
            message: 'Contact record created successfully'
        });
    } catch (error) {
        console.error('Contact submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during contact submission'
        });
    }
});

module.exports = router;
