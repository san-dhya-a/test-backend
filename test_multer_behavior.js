const express = require('express');
const multer = require('multer');
const axios = require('axios');

const app = express();
const upload = multer();

app.use(express.json());

app.put('/test', upload.single('photo'), (req, res) => {
    console.log('Body keys:', Object.keys(req.body));
    res.json({ bodyKeys: Object.keys(req.body) });
});

const server = app.listen(5001, async () => {
    try {
        const res = await axios.put('http://localhost:5001/test', { name: 'test' });
        console.log('Result:', res.data);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        server.close();
    }
});
