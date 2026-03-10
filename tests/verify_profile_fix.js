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
            full_name: 'Test User',
            cpf_cnpj: '123.456.789-00',
            cargo: 'Developer',
            cep: '12345-678',
            address: 'Main St',
            house_number: '100',
            state: 'SP',
            city: 'São Paulo',
            neighborhood: 'Centro',
            phone_mobile: '99999-9999',
            gender: 'Non-binary'
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
            'cargo', 'full_name', 'cpf_cnpj', 'email', 'cep', 'address',
            'house_number', 'complement', 'state', 'city', 'neighborhood',
            'phone_residential', 'phone_mobile', 'gender'
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
