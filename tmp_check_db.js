const db = require('./config/db');

async function checkDb() {
    try {
        const results = {};
        const [tables] = await db.execute("SHOW TABLES");
        
        for (const tableRow of tables) {
            const tableName = Object.values(tableRow)[0];
            const [columns] = await db.execute(`DESCRIBE ${tableName}`);
            results[tableName] = columns.map(c => ({
                Field: c.Field,
                Type: c.Type,
                Null: c.Null,
                Key: c.Key,
                Default: c.Default,
                Extra: c.Extra
            }));
        }
        
        const fs = require('fs');
        fs.writeFileSync('db_check_results.json', JSON.stringify(results, null, 2));
        console.log("Results written to db_check_results.json");
        process.exit(0);
    } catch (error) {
        console.error("Error checking DB:", error);
        process.exit(1);
    }
}

checkDb();
