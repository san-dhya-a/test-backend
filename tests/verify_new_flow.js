const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
    console.log('--- Starting Integration Test ---');

    try {
        // 1. Register
        console.log('\n[1] Testing Register...');
        const email = `testuser_${Date.now()}@example.com`;
        const registerRes = await axios.post(`${BASE_URL}/auth/register`, {
            name: 'Test User',
            email: email,
            password: 'password123'
        });
        console.log('Register Response:', registerRes.data);

        // 2. Login
        console.log('\n[2] Testing Login...');
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: email,
            password: 'password123'
        });
        console.log('Login Response:', loginRes.data);
        const token = loginRes.data.data.token;

        // 3. Profile
        console.log('\n[3] Testing Profile Get...');
        const profileRes = await axios.get(`${BASE_URL}/account/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Profile Response:', profileRes.data);

        // 4. Update Profile (Check redirect signal)
        console.log('\n[4] Testing Update Profile (Redirect check)...');
        const updateRes = await axios.post(`${BASE_URL}/account/update-profile`, {
            name: 'Updated Name'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Update Profile Response:', updateRes.data);

        // 5. Contact Submit
        console.log('\n[5] Testing Contact Submit...');
        const contactRes = await axios.post(`${BASE_URL}/contact`, {
            name: 'Test User',
            email: email,
            message: 'Hello, this is a test message',
            cpf_cnpj: '123.456.789-00'
        });
        console.log('Contact Response:', contactRes.data);

        console.log('\n--- All tests passed! ---');
    } catch (error) {
        console.error('Test failed:', error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

runTests();
