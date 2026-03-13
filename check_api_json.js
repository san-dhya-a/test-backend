const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkProfileResponse() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        const email = 'sandhya@gmail.com';
        const [rows] = await connection.execute('SELECT * FROM user WHERE email = ?', [email]);
        const user = rows[0];
        
        console.log('--- RAW DB RECORD ---');
        console.log(JSON.stringify(user, null, 2));

        // Simulate backend processing (delete password)
        delete user.password;
        
        console.log('\n--- SIMULATED API RESPONSE DATA ---');
        console.log(JSON.stringify(user, null, 2));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

checkProfileResponse();
