const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDb() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        console.log('Connected to DB:', process.env.DB_NAME);

        const [tables] = await connection.execute('SHOW TABLES');
        console.log('Tables:', JSON.stringify(tables, null, 2));

        for (const tableRow of tables) {
            const tableName = Object.values(tableRow)[0];
            const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
            console.log(`Columns for ${tableName}:`, JSON.stringify(columns, null, 2));
        }

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkDb();
