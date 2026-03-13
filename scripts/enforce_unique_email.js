const mysql = require('mysql2/promise');
require('dotenv').config();

async function enforceUniqueEmail() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        console.log('--- Step 2: Enforcing Unique Email Constraint ---');
        
        // Check if index already exists
        const [indexes] = await connection.execute('SHOW INDEX FROM user WHERE Column_name = "email"');
        
        if (indexes.length > 0) {
            console.log('Unique constraint (or index) already exists on email column.');
        } else {
            console.log('Adding UNIQUE constraint to user.email...');
            await connection.execute('ALTER TABLE user ADD UNIQUE (email)');
            console.log('✅ UNIQUE constraint added successfully.');
        }

    } catch (error) {
        console.error('Migration Error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            console.error('❌ Error: Duplicate entries still exist. Run cleanup script first.');
        }
    } finally {
        if (connection) await connection.end();
    }
}

enforceUniqueEmail();
