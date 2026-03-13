const express = require('express');
const cors = require('cors');
require('dotenv').config({ debug: true });
const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const accountRoutes = require('./routes/accountRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/account', accountRoutes);


// Test Route
app.get('/', (req, res) => {
    res.json({
        error: false,
        message: 'API is running...',
        data: {}
    });
});

// 404 Global Handler
app.use((req, res) => {
    res.status(404).json({
        error: true,
        message: 'Route not found',
        data: {}
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('CWD:', process.cwd());
});
