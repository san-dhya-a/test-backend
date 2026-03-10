const axios = require('axios');

async function testLoginFailure() {
    const loginUrl = 'http://localhost:5000/api/auth/login';

    console.log('--- Testing Login Failure with Incorrect Credentials ---');
    try {
        const response = await axios.post(loginUrl, {
            email: 'nonexistent@example.com',
            password: 'wrongpassword'
        });
        console.log('❌ FAIL: Expected 401 status but got 200');
        process.exit(1);
    } catch (error) {
        if (error.response) {
            console.log('Response Status:', error.response.status);
            console.log('Response Data:', JSON.stringify(error.response.data, null, 2));

            if (error.response.status === 401 &&
                error.response.data.error === true &&
                error.response.data.message === 'Invalid credentials') {
                console.log('✅ PASS: status is 401, error is true and message is "Invalid credentials".');
            } else {
                console.error('❌ FAIL: Unexpected response:', error.response.status, error.response.data);
                process.exit(1);
            }
        } else {
            console.error('❌ Test Error:', error.message);
            process.exit(1);
        }
    }

    console.log('\n--- Testing Login Failure with Missing Fields ---');
    try {
        const response = await axios.post(loginUrl, {
            email: 'test@example.com'
            // password missing
        });
        console.log('❌ FAIL: Expected 401 status but got 200');
        process.exit(1);
    } catch (error) {
        if (error.response) {
            console.log('Response Status:', error.response.status);
            console.log('Response Data:', JSON.stringify(error.response.data, null, 2));

            if (error.response.status === 401 &&
                error.response.data.error === true &&
                error.response.data.message === 'Invalid credentials') {
                console.log('✅ PASS: status is 401, error is true and message is "Invalid credentials".');
            } else {
                console.error('❌ FAIL: Unexpected response:', error.response.status, error.response.data);
                process.exit(1);
            }
        } else {
            console.error('❌ Test Error:', error.message);
            process.exit(1);
        }
    }
}

testLoginFailure();
