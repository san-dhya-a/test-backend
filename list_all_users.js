const mysql = require('mysql2/promise');
require('dotenv').config();

async function listUsers() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        const [rows] = await connection.execute('SELECT * FROM user');
        console.log('Total Users:', rows.length);
        rows.forEach(u => {
            console.log(`ID: ${u.id}, Nome: ${u.nomeCompleto}, Email: ${u.email}, Cargo: ${u.cargo}, CPF: ${u.cpfCnpj}`);
        });

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}
listUsers();
