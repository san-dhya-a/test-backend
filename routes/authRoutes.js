const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Profile API - GET/POST /api/profile
 * Returns all fields from the 'user' table
 */
const getProfile = async (req, res) => {
    try {
        const email = req.query.email || req.body.email;
        if (!email) {
            console.log('[Profile] Missing email in request');
            return res.status(400).json({
                error: true,
                message: 'Invalid: Email is required as a query parameter or in the body'
            });
        }

        console.log('[Profile] Fetching for:', email);
        const [rows] = await db.execute('SELECT * FROM user WHERE email = ?', [email]);
        const user = rows[0];

        if (!user) {
            console.log('[Profile] User not found:', email);
            return res.status(404).json({
                error: true,
                message: 'User not found'
            });
        }

        // Security: Remove password
        delete user.password;

        res.json({
            success: true,
            data: user,
            message: 'Success'
        });
    } catch (error) {
        console.error('[Profile] Error:', error);
        res.status(500).json({
            error: true,
            message: 'Internal server error during profile fetch'
        });
    }
};

// Register routes directly at the top
router.get('/profile', getProfile);
router.post('/profile', getProfile);
router.get('/auth/profile', getProfile);
router.post('/auth/profile', getProfile);

// Registration and Login
router.post('/auth/register', async (req, res) => {
    const { name, nomeCompleto, email, password, ...rest } = req.body;
    
    // Support both 'name' and 'nomeCompleto'
    const finalName = nomeCompleto || name;
    
    if (!finalName || !email || !password) {
        return res.status(400).json({ 
            error: true, 
            message: 'Missing required fields: name (or nomeCompleto), email, and password' 
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Define all valid columns for the user table (matching user_table_columns.json)
        const validColumns = [
            'cargo', 'nomeCompleto', 'cpfCnpj', 'email', 'cep', 'endereco', 
            'numero', 'complemento', 'uf', 'cidade', 'bairro', 
            'telefoneResidencial', 'telefoneCelular', 'genero'
        ];

        const userData = {
            nomeCompleto: finalName,
            email,
            password: hashedPassword,
            ...rest
        };

        // Sanitize CPF and CEP (remove extra spaces)
        if (userData.cpfCnpj) {
            userData.cpfCnpj = userData.cpfCnpj.replace(/\s+/g, '').trim();
        }
        if (userData.cep) {
            userData.cep = userData.cep.replace(/\s+/g, '').trim();
        }

        // Filter provided data to only include valid columns
        const filteredData = Object.keys(userData)
            .filter(key => validColumns.includes(key))
            .reduce((obj, key) => {
                obj[key] = userData[key];
                return obj;
            }, {});

        // Build dynamic query
        const columns = ['password', ...Object.keys(filteredData)];
        const values = [hashedPassword, ...Object.values(filteredData)];
        const placeholders = columns.map(() => '?').join(', ');

        const query = `INSERT INTO user (${columns.join(', ')}) VALUES (${placeholders})`;
        
        console.log('[Register] Executing query:', query);
        const [result] = await db.execute(query, values);
        
        res.status(201).json({ 
            error: false, 
            message: 'Success', 
            data: { userId: result.insertId } 
        });
    } catch (error) {
        console.error('[Register] Error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: true, message: 'Email already exists' });
        }
        res.status(500).json({ error: true, message: 'Server error' });
    }
});

router.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: true, message: 'Missing fields' });
    try {
        const [rows] = await db.execute('SELECT * FROM user WHERE email = ?', [email]);
        const user = rows[0];
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: true, message: 'Invalid credentials' });
        }
        const token = jwt.sign({ userId: user.id, email: user.email, nomeCompleto: user.nomeCompleto }, JWT_SECRET, { expiresIn: '24h' });
        await db.execute('INSERT INTO user_tokens (user_id, token) VALUES (?, ?)', [user.id, token]);
        res.json({ error: false, data: { userId: user.id, token, redirectTo: 'Minha Conta' }, message: 'Success' });
    } catch (error) {
        res.status(500).json({ error: true, message: 'Server error' });
    }
});

// Legacy redirects
router.post('/register', (req, res) => res.redirect(307, '/api/auth/register'));
router.post('/login', (req, res) => res.redirect(307, '/api/auth/login'));

module.exports = router;
