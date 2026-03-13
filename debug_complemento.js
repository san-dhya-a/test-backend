const mysql = require('mysql2/promise');
require('dotenv').config();

async function debugComplemento() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        const email = 'sandhya@gmail.com';
        console.log('--- Checking current value ---');
        const [rowsBefore] = await connection.execute('SELECT id, email, complemento FROM user WHERE email = ?', [email]);
        console.log('Before:', rowsBefore[0]);

        console.log('\n--- Updating complemento to "Apto 2" ---');
        await connection.execute('UPDATE user SET complemento = ? WHERE email = ?', ['Apto 2', email]);

        const [rowsAfter] = await connection.execute('SELECT id, email, complemento FROM user WHERE email = ?', [email]);
        console.log('After update:', rowsAfter[0]);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

debugComplemento();
