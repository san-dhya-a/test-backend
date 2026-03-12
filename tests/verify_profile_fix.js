const axios = require('axios');

async function verifyProfile() {
    const baseUrl = 'http://localhost:5000/api';
    const email = `test_${Date.now()}@example.com`;
    const password = 'password123';

    try {
        console.log('--- Step 1: Register New User ---');
        const regRes = await axios.post(`${baseUrl}/auth/register`, {
            email,
            password,
            nomeCompleto: 'Test User',
            cpfCnpj: '123.456.789-00',
            cargo: 'Developer',
            cep: '12345-678',
            endereco: 'Main St',
            numero: '100',
            uf: 'SP',
            cidade: 'São Paulo',
            bairro: 'Centro',
            telefoneCelular: '99999-9999',
            genero: 'Non-binary'
        });
        console.log('✅ Registration successful');

        console.log('\n--- Step 2: Login ---');
        const loginRes = await axios.post(`${baseUrl}/auth/login`, {
            email,
            password
        });
        const token = loginRes.data.data.token;
        console.log('✅ Login successful');

        console.log('\n--- Step 3: Fetch Profile ---');
        const profileRes = await axios.get(`${baseUrl}/account/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('✅ Profile Response:', JSON.stringify(profileRes.data, null, 2));

        const expectedFields = [
            'cargo', 'nomeCompleto', 'cpfCnpj', 'email', 'cep', 'endereco',
            'numero', 'complemento', 'uf', 'cidade', 'bairro',
            'telefoneResidencial', 'telefoneCelular', 'genero'
        ];

        const receivedFields = Object.keys(profileRes.data.data);
        const missingFields = expectedFields.filter(field => !receivedFields.includes(field));

        if (missingFields.length === 0) {
            console.log('\n✨ SUCCESS: All expected fields are present in the profile response.');
        } else {
            console.error('\n❌ FAILURE: Missing fields in response:', missingFields);
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Error during verification:', error.response?.data || error.message);
        process.exit(1);
    }
}
verifyProfile();
