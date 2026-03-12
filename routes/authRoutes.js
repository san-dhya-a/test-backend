const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const router = express.Router();
const logJwt = require('../jwt_logger');

const JWT_SECRET = process.env.JWT_SECRET;
logJwt(`authRoutes Loaded. JWT_SECRET exists: ${!!JWT_SECRET}`);
if (JWT_SECRET) logJwt(`authRoutes JWT_SECRET starts with: ${JWT_SECRET.substring(0, 3)}...`);

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
    console.log('--- EXECUTING NEW REGISTER ROUTE ---');
    console.log('Registration request body:', req.body);
    const {
        cargo, nomeCompleto, cpfCnpj, email, cep, endereco, numero,
        complemento, uf, cidade, bairro, telefoneResidencial,
        telefoneCelular, genero, password
    } = req.body;

    // Standardize variables for DB columns
    const db_nomeCompleto = nomeCompleto;
    const db_cpfCnpj = cpfCnpj;
    const db_endereco = endereco;
    const db_numero = numero;
    const db_complemento = complemento;
    const db_uf = uf;
    const db_cidade = cidade;
    const db_bairro = bairro;
    const db_telefoneResidencial = telefoneResidencial;
    const db_telefoneCelular = telefoneCelular;
    const db_genero = genero;

    if (!email || !password || !db_nomeCompleto || !db_cpfCnpj) {
        console.warn('Registration failed: Mandatory fields missing', {
            email: !!email,
            password: !!password,
            nomeCompleto: !!db_nomeCompleto,
            cpfCnpj: !!db_cpfCnpj
        });
        return res.status(400).json({
            error: true,
            I_AM_REALLY_THE_NEW_REGISTER_ROUTE: true,
            message: 'Invalid: Mandatory fields missing (email, password, nomeCompleto, cpfCnpj)',
            data: {
                missing: {
                    email: !email,
                    password: !password,
                    nomeCompleto: !db_nomeCompleto,
                    cpfCnpj: !db_cpfCnpj
                },
                receivedFields: Object.keys(req.body)
            }
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.execute(
            `INSERT INTO user (
                cargo, nomeCompleto, cpfCnpj, email, cep, endereco, numero, 
                complemento, uf, cidade, bairro, telefoneResidencial, 
                telefoneCelular, genero, password
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                cargo || null, db_nomeCompleto, db_cpfCnpj, email, cep || null, db_endereco || null,
                db_numero || null, db_complemento || null, db_uf || null, db_cidade || null,
                db_bairro || null, db_telefoneResidencial || null, db_telefoneCelular || null,
                db_genero || null, hashedPassword
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

        const [rows] = await db.execute('SELECT * FROM user WHERE email = ?', [identifier]);
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
            { userId: user.id, email: user.email, nomeCompleto: user.nomeCompleto },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        logJwt(`Generated Token for ${user.email}. Length: ${token.length}. Start: ${token.substring(0, 15)}...`);

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
