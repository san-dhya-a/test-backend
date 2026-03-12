const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config({ debug: true });

async function getContactsSchema() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        const [columns] = await connection.execute('DESCRIBE contacts');
        fs.writeFileSync('schema_output_v2.json', JSON.stringify(columns, null, 2));
        console.log('Schema written to schema_output_v2.json');

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}
getContactsSchema();
