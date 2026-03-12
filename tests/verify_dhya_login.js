const axios = require('axios');

async function verifyLogin() {
    const loginUrl = 'http://localhost:5000/api/auth/login';
    const credentials = {
        email: 'dhya@gmail.com',
        password: '1234567890'
    };

    try {
        console.log('--- Verifying Login for dhya@gmail.com ---');
        const response = await axios.post(loginUrl, credentials);
        console.log('✅ Login successful:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        if (error.response) {
            console.error('❌ Login failed:', error.response.status, error.response.data);
        } else {
            console.error('❌ Error:', error.message);
        }
    }
}

verifyLogin();
