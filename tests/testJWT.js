const axios = require('axios');
const FormData = require('form-data');

async function testJWTFlow() {
    const loginUrl = 'http://localhost:5000/api/auth/login';
    const profileUrl = 'http://localhost:5000/api/account/profile';
    const updateUrl = 'http://localhost:5000/api/account/update-profile';

    try {
        console.log('--- Step 1: Login to get JWT ---');
        const loginRes = await axios.post(loginUrl, {
            email: 'roberto@gmail.com', // Corrected from username to email
            password: 'password'
        });

        const token = loginRes.data?.data?.token;
        if (!token) {
            throw new Error('Login failed: Token not received. Response: ' + JSON.stringify(loginRes.data));
        }
        console.log('✅ Login successful. Token received:', token.substring(0, 20) + '...');

        console.log('\n--- Step 2: Fetch Profile with Token ---');
        const profileRes = await axios.get(profileUrl, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('✅ Profile fetch successful:', JSON.stringify(profileRes.data, null, 2));

        console.log('\n--- Step 3: Update Profile with Token ---');
        const form = new FormData();
        form.append('nomeCompleto', 'Updated Roberto');
        const updateRes = await axios.post(updateUrl, form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('✅ Profile update successful:', JSON.stringify(updateRes.data, null, 2));

        console.log('\n--- Step 4: Test Unauthorized Access ---');
        try {
            await axios.get(profileUrl);
        } catch (err) {
            console.log('✅ Unauthorized access correctly rejected with status:', err.response.status);
        }

    } catch (error) {
        if (error.response) {
            console.error('❌ Test Failed:', error.response.status, error.response.data);
        } else {
            console.error('❌ Test Error:', error.message);
        }
        console.log('\nNote: Ensure backend is running and user credentials are valid.');
    }
}

testJWTFlow();
