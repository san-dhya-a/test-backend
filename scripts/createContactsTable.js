const db = require('../config/db');

async function createContactsTable() {
    try {
        console.log('--- Creating contacts table ---');

        // Drop existing table to ensure new schema is applied
        await db.execute('DROP TABLE IF EXISTS contacts');
        console.log('Old contacts table dropped');

        const createTableQuery = `
      CREATE TABLE contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL,
        phone VARCHAR(20),
        subject VARCHAR(200),
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
      )
    `;

        await db.execute(createTableQuery);
        console.log('✅ contacts table created successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating contacts table:', error);
        process.exit(1);
    }
}

createContactsTable();
