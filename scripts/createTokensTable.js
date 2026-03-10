const db = require('./config/db');

async function createTokensTable() {
    const query = `
        CREATE TABLE IF NOT EXISTS user_tokens (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            token TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `;
    try {
        await db.execute(query);
        console.log('Table user_tokens created successfully or already exists.');
    } catch (error) {
        console.error('Error creating user_tokens table:', error);
    }
}

createTokensTable();
