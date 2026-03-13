const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function verifyProfileFix() {
    console.log('--- Verifying Profile API Fix ---');

    try {
        const testEmail = `verify_${Date.now()}@example.com`;
        
        // 1. Register
        console.log('\n[1] Testing Register (/api/auth/register)...');
        await axios.post(`${BASE_URL}/auth/register`, {
            name: 'Verify User',
            email: testEmail,
            password: 'password123'
        });
        console.log('Register: Success');

        // 2. Login
        console.log('\n[2] Testing Login (/api/auth/login)...');
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: testEmail,
            password: 'password123'
        });
        console.log('Login: Success');

        // 3. Profile (New!)
        console.log('\n[3] Testing Profile (/api/profile?email=...)...');
        const profileRes = await axios.get(`${BASE_URL}/profile`, {
            params: { email: testEmail }
        });
        console.log('Profile Response:', profileRes.data);

        if (profileRes.data.success && profileRes.data.data.email === testEmail) {
            console.log('\n--- SUCCESS: Profile API is working correctly! ---');
        } else {
            console.error('\n--- FAILURE: Profile data mismatch ---');
            process.exit(1);
        }

    } catch (error) {
        console.error('Verification failed:', error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

verifyProfileFix();
