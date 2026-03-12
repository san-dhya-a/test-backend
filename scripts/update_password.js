const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function updatePassword() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        const email = 'dhya@gmail.com';
        const plainPassword = '1234567890';
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        const [result] = await connection.execute(
            'UPDATE user SET password = ? WHERE email = ?',
            [hashedPassword, email]
        );

        console.log(`Updated ${result.affectedRows} row(s) for ${email}`);
        
        // Verify update
        const [rows] = await connection.execute('SELECT email, password FROM user WHERE email = ?', [email]);
        console.log('User password now is:', rows[0].password);

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

updatePassword();
