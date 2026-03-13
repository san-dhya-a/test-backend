const mysql = require('mysql2/promise');
require('dotenv').config();

async function cleanupDuplicates() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        console.log('--- Step 1: Identifying duplicates ---');
        const [duplicates] = await connection.execute(`
            SELECT email FROM user 
            GROUP BY email 
            HAVING COUNT(*) > 1
        `);

        if (duplicates.length === 0) {
            console.log('No duplicates found.');
            return;
        }

        for (const duplicate of duplicates) {
            const email = duplicate.email;
            console.log(`\nProcessing email: ${email}`);

            // Get all records for this email
            const [rows] = await connection.execute('SELECT * FROM user WHERE email = ? ORDER BY id ASC', [email]);
            
            // Logic: Keep the record with the most non-null fields or the latest one if tied.
            // For sandhya@gmail.com, we know ID 62 is the "good" one based on previous inspection.
            // A general rule: Keep the one with the most populated fields.
            
            let bestRecord = rows[0];
            let maxNonEmptyFields = 0;

            rows.forEach(row => {
                let nonEmptyFields = Object.values(row).filter(val => val !== null && val !== '').length;
                if (nonEmptyFields >= maxNonEmptyFields) {
                    maxNonEmptyFields = nonEmptyFields;
                    bestRecord = row;
                }
            });

            console.log(`Keeping record ID: ${bestRecord.id} (${maxNonEmptyFields} fields populated)`);

            const idsToDelete = rows.map(r => r.id).filter(id => id !== bestRecord.id);
            
            if (idsToDelete.length > 0) {
                console.log(`Deleting record IDs: ${idsToDelete.join(', ')}`);
                await connection.execute(`DELETE FROM user WHERE id IN (${idsToDelete.map(() => '?').join(',')})`, idsToDelete);
                
                // Also cleanup associated tokens for deleted users
                await connection.execute(`DELETE FROM user_tokens WHERE user_id IN (${idsToDelete.map(() => '?').join(',')})`, idsToDelete);
            }
        }

        console.log('\n--- Cleanup Complete ---');

    } catch (error) {
        console.error('Cleanup Error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

cleanupDuplicates();
