const axios = require('axios');

const BASE_URL = 'http://127.0.0.1:5000/api';

async function verifyFinalFix() {
    console.log('--- Final Verification of POST /api/profile ---');

    try {
        // We'll use an existing email if possible, or register a new one
        const testEmail = 'verify_final@example.com';
        
        // Try to register first (catch if already exists)
        try {
            await axios.post(`${BASE_URL}/auth/register`, {
                name: 'Final Verify User',
                email: testEmail,
                password: 'password123'
            });
            console.log('Register: Success (New user)');
        } catch (e) {
            console.log('Register: User might already exist (Status:', e.response?.status || 'Error', ')');
        }

        // Test POST /api/profile
        console.log(`\nTesting POST ${BASE_URL}/profile...`);
        const profileRes = await axios.post(`${BASE_URL}/profile`, {
            email: testEmail
        });
        
        console.log('Profile Response:', JSON.stringify(profileRes.data, null, 2));

        if (profileRes.data.success && profileRes.data.data.email === testEmail) {
            console.log('\n--- SUCCESS: POST /api/profile is working! ---');
        } else {
            console.error('\n--- FAILURE: Incorrect response ---');
            process.exit(1);
        }

    } catch (error) {
        console.error('Verification failed:', error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

verifyFinalFix();
