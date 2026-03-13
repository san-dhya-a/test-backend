const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkProfileData() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        // Current active user record for sandhya@gmail.com is ID 63
        const [rows] = await connection.execute('SELECT * FROM user WHERE id = 63');
        const user = rows[0];
        
        console.log('SQL Result for Complemento:', user.complemento);
        console.log('Type of Complemento:', typeof user.complemento);
        console.log('Is it null?:', user.complemento === null);
        console.log('Is it empty string?:', user.complemento === '');
        console.log('Is it "null" string?:', user.complemento === 'null');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

checkProfileData();
