const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkUser() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        const [rows] = await connection.execute('SELECT email, password FROM user WHERE email = ?', ['dhya@gmail.com']);
        console.log('User found:', rows);
        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkUser();
