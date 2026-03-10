const axios = require('axios');

async function testNewAuthFlow() {
    const registerUrl = 'http://localhost:5000/api/auth/register';
    const loginUrl = 'http://localhost:5000/api/auth/login';
    const profileUrl = 'http://localhost:5000/api/account/profile';

    const testUser = {
        cargo: 'Developer',
        full_name: 'Test Instance',
        cpf_cnpj: '123.456.789-00',
        email: `test_${Date.now()}@example.com`,
        cep: '12345-678',
        address: 'Main St',
        house_number: '100',
        complement: 'Apt 1',
        state: 'SP',
        city: 'São Paulo',
        neighborhood: 'Centro',
        phone_residential: '(11) 1234-5678',
        phone_mobile: '(11) 91234-5678',
        gender: 'Not specified',
        password: 'securepassword123'
    };

    try {
        console.log('--- Step 1: Register New User ---');
        const regRes = await axios.post(registerUrl, testUser);
        console.log('✅ Registration successful:', JSON.stringify(regRes.data, null, 2));

        console.log('\n--- Step 2: Login with New User ---');
        const loginRes = await axios.post(loginUrl, {
            email: testUser.email,
            password: testUser.password
        });

        const token = loginRes.data.data.token;
        console.log('✅ Login successful. Token received:', token.substring(0, 20) + '...');

        console.log('\n--- Step 3: Fetch Profile with Token ---');
        const profileRes = await axios.get(profileUrl, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('✅ Profile fetch successful:', JSON.stringify(profileRes.data, null, 2));

    } catch (error) {
        if (error.response) {
            console.error('❌ Test Failed:', error.response.status, error.response.data);
        } else {
            console.error('❌ Test Error:', error.message);
        }
    }
}

testNewAuthFlow();
