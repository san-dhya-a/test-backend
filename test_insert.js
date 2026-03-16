const db = require('./config/db');
const bcrypt = require('bcrypt');

async function testInsert() {
    try {
        const hashedPassword = await bcrypt.hash('password123', 10);
        const userData = {
            cargo: 'PDV',
            nomeCompleto: 'Test User',
            cpfCnpj: '12345678901',
            email: 'test' + Date.now() + '@example.com',
            cep: '12345678',
            endereco: 'Rua Teste',
            numero: '123',
            uf: 'SP',
            cidade: 'São Paulo',
            bairro: 'Centro',
            telefoneCelular: '11999999999',
            genero: 'Male'
        };

        const columns = ['password', ...Object.keys(userData)];
        const values = [hashedPassword, ...Object.values(userData)];
        const placeholders = columns.map(() => '?').join(', ');

        const query = `INSERT INTO user (${columns.join(', ')}) VALUES (${placeholders})`;
        
        console.log('Executing query:', query);
        const [result] = await db.execute(query, values);
        console.log('Success! InsertId:', result.insertId);
        
        process.exit(0);
    } catch (error) {
        console.error('Insert failed:', error);
        process.exit(1);
    }
}

testInsert();
