const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// Ensure uploads directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configure Multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });
/**
 * Middleware to authenticate JWT token and validate against DB
 */
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    // Improved Token Extraction
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
    console.log('Extracted Token (Length: ' + (token ? token.length : 0) + '):', token ? token.substring(0, 15) + '...' : 'null');

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. No token provided.'
        });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('Decoded Token:', decoded);

        const [rows] = await db.execute(
            'SELECT * FROM user_tokens WHERE token = ? AND user_id = ?',
            [token, decoded.userId]
        );

        if (rows.length === 0) {
            console.log('Token not found in database or user mismatch');
            return res.status(403).json({
                success: false,
                message: 'Invalid or expired token.'
            });
        }
        req.user = decoded;
        next();
    } catch (error) {
        console.error('JWT Error:', error.name, '-', error.message);
        if (error.name === 'JsonWebTokenError' && error.message === 'jwt malformed') {
            console.error('DEBUG: Malformed Token attempted:', token);
        }
        return res.status(403).json({
            success: false,
            message: 'Invalid token.'
        });
    }
};
/**
 * Get Minha Conta profile data
 * Route: GET /api/account/profile
 */
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const [users] = await db.execute(
            'SELECT cargo, nomeCompleto, cpfCnpj, email, cep, endereco, numero, complemento, uf, cidade, bairro, telefoneResidencial, telefoneCelular, genero FROM user WHERE id = ?',
            [req.user.userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        console.log('--- EXECUTING UPDATED PORTUGUESE PROFILE QUERY ---');
        console.log('DEBUG: DB Result Keys:', Object.keys(users[0]));

        res.json({
            success: true,
            data: users[0],
            I_AM_THE_CORRECT_VERSION: true,
            message: 'Profile data retrieved successfully - ' + Date.now()
        });
    } catch (error) {
        console.error('Account profile fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching profile'
        });
    }
});


/**
 * Handle Minha Conta profile update
 * Route: POST /api/account/update-profile
 */
router.post('/update-profile', authenticateToken, upload.single('fotoPerfil'), async (req, res) => {
    try {
        console.log('Account update body received:', req.body);

        // As requested: Accept whatever data is sent and return a simple success message.
        // No predefined data object or strict validation.

        res.json({
            success: true,
            message: 'Profile updated successfully'
        });

    } catch (error) {
        console.error('Account update error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during profile update'
        });
    }
});
module.exports = router;
