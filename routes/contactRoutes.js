const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../config/db');
const router = express.Router();

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

/**
 * Public Contact Submission Route
 * Field mappings: name, email, cpf_cnpj, message, file
 */
router.post('/', upload.single('file'), async (req, res) => {
    try {
        console.log('--- Contact Submission Start ---');
        console.log('Body:', req.body);
        console.log('File:', req.file);
        const { name, email, cpf_cnpj, message } = req.body;
        const file = req.file ? req.file.path : null;

        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: 'Mandatory fields missing (name, email, message)'
            });
        }

        const [result] = await db.execute(
            'INSERT INTO contacts (name, email, cpf_cnpj, message, file) VALUES (?, ?, ?, ?, ?)',
            [name, email, cpf_cnpj || null, message, file]
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
