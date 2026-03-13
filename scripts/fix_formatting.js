const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixFormatting() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        console.log('--- Step 1: Fetching records with potential formatting issues ---');
        const [users] = await connection.execute('SELECT id, cpfCnpj, cep FROM user');

        let updatedCount = 0;

        for (const user of users) {
            let updates = {};
            
            if (user.cpfCnpj && user.cpfCnpj.includes(' ')) {
                updates.cpfCnpj = user.cpfCnpj.replace(/\s+/g, '').trim();
            }
            
            if (user.cep && user.cep.includes(' ')) {
                updates.cep = user.cep.replace(/\s+/g, '').trim();
            }

            if (Object.keys(updates).length > 0) {
                const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
                const values = [...Object.values(updates), user.id];
                
                await connection.execute(`UPDATE user SET ${setClause} WHERE id = ?`, values);
                console.log(`Updated user ID ${user.id}:`, updates);
                updatedCount++;
            }
        }

        console.log(`\n--- Done! Total users fixed: ${updatedCount} ---`);

    } catch (error) {
        console.error('Migration Error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

fixFormatting();
