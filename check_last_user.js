const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkLastUser() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        const [rows] = await connection.execute('SELECT * FROM user ORDER BY id DESC LIMIT 1');
        console.log('Last User in DB:', JSON.stringify(rows[0], null, 2));

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}
checkLastUser();
