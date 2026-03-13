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
        console.log('Fetching full profile from "user" table for ID:', req.user.userId);
        const [rows] = await db.execute(
            'SELECT * FROM user WHERE id = ?',
            [req.user.userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = rows[0];
        // Remove sensitive password from response
        delete user.password;

        res.json({
            success: true,
            data: user,
            message: 'Profile data retrieved successfully'
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
 * Route: PUT /api/account/update-profile
 */
router.put('/update-profile', authenticateToken, (req, res, next) => {
    console.log('[AccountUpdate] Middleware Check - Body keys:', Object.keys(req.body));
    next();
}, /* upload.single('fotoPerfil'), */ async (req, res) => {
    try {
        const userId = req.user.userId;
        console.log('[AccountUpdate] User:', userId, 'Body keys:', Object.keys(req.body));
        console.log('[AccountUpdate] Complemento value:', req.body.complemento);
        
        const validColumns = [
            'cargo', 'nomeCompleto', 'cpfCnpj', 'cep', 'endereco', 
            'numero', 'complemento', 'uf', 'cidade', 'bairro', 
            'telefoneResidencial', 'telefoneCelular', 'genero'
        ];

        // Filter update data
        const updateData = {};
        console.log('[AccountUpdate] Filtering keys from req.body. Body is:', JSON.stringify(req.body));
        for (const key of validColumns) {
            if (req.body[key] !== undefined) {
                console.log(`[AccountUpdate] Found key "${key}" in body:`, req.body[key]);
                let value = req.body[key] === 'null' ? null : req.body[key];
               
                // Sanitize CPF and CEP (remove extra spaces)
                if ((key === 'cpfCnpj' || key === 'cep') && value) {
                    value = value.replace(/\s+/g, '').trim();
                }
                
                updateData[key] = value;
            }
        }

        // Password update logic
        if (req.body.novaSenha && req.body.senhaAtual) {
            console.log('[AccountUpdate] Processing password change...');
            
            // 1. Fetch current user to get password hash
            const [rows] = await db.execute('SELECT password FROM user WHERE id = ?', [userId]);
            const user = rows[0];
            
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            // 2. Verify current password
            const isMatch = await bcrypt.compare(req.body.senhaAtual, user.password);
            if (!isMatch) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Senha atual incorreta. Não foi possível alterar a senha.' 
                });
            }

            // 3. Hash new password and add to updateData
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(req.body.novaSenha, salt);
            console.log('[AccountUpdate] New password hashed and added to update.');
        }

        // If a file was uploaded, we'd normally save it. 
        // Note: Checking if there's a column for photo (usually 'fotoPerfil' based on req.body keys or schema)
        // I'll check user_table_columns.json again - wait, I already saw it. 
        // It didn't have a 'fotoPerfil' column in the json I saw earlier (lines 1-146).
        // Let's check if I missed it.

        if (Object.keys(updateData).length === 0 && !req.file) {
            return res.status(400).json({
                success: false,
                message: 'No data provided for update'
            });
        }

        if (Object.keys(updateData).length > 0) {
            const setClause = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
            const values = [...Object.values(updateData), userId];
            
            const query = `UPDATE user SET ${setClause} WHERE id = ?`;
            console.log('[UpdateProfile] Executing query:', query);
            await db.execute(query, values);
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            redirectTo: 'Fale Conosco'
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
