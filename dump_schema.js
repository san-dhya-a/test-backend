const mysql = require('mysql2/promise');
require('dotenv').config();

async function getFullSchema() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        const [tables] = await connection.execute('SHOW TABLES');
        const schema = {};

        for (const tableRow of tables) {
            const tableName = Object.values(tableRow)[0];
            const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
            schema[tableName] = columns;
        }

        const fs = require('fs');
        fs.writeFileSync('full_schema.json', JSON.stringify(schema, null, 2));
        console.log('Full schema written to full_schema.json');

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}
getFullSchema();
