const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkFormats() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        const [rows] = await connection.execute('SELECT id, email, cpfCnpj, cep FROM user');
        console.log('--- USER DATA ---');
        rows.forEach(r => {
            console.log(`ID: ${r.id}, Email: ${r.email}, CPF: [${r.cpfCnpj}], CEP: [${r.cep}]`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

checkFormats();
