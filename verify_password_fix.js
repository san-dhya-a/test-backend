const axios = require('axios');

async function testPasswordUpdate() {
    const baseUrl = 'http://localhost:5000/api';
    const email = 'sandhya@gmail.com';
    const password = 'password123'; // Current password from previous context or standard test password

    try {
        console.log('--- 1. Logging in to get token ---');
        const loginRes = await axios.post(`${baseUrl}/auth/login`, { email, password });
        const token = loginRes.data.data.token;
        console.log('Login successful.');

        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        console.log('\n--- 2. Updating profile WITHOUT password change ---');
        const updateRes1 = await axios.put(`${baseUrl}/account/update-profile`, {
            nomeCompleto: 'Sandhya Updated',
            complemento: 'Apto 2 - Updated'
        }, config);
        console.log('Update without password status:', updateRes1.data.success);

        console.log('\n--- 3. Trying to update password with WRONG current password ---');
        try {
            await axios.put(`${baseUrl}/account/update-profile`, {
                senhaAtual: 'wrongpassword',
                novaSenha: 'newpassword123'
            }, config);
        } catch (err) {
            console.log('Expected failure (Wrong current password):', err.response.data.message);
        }

        console.log('\n--- 4. Updating password with CORRECT current password ---');
        const updateRes2 = await axios.put(`${baseUrl}/account/update-profile`, {
            senhaAtual: password,
            novaSenha: 'newpassword123'
        }, config);
        console.log('Update with password successful:', updateRes2.data.success);

        console.log('\n--- 5. Verifying login with NEW password ---');
        const loginRes2 = await axios.post(`${baseUrl}/auth/login`, { 
            email, 
            password: 'newpassword123' 
        });
        console.log('Login with new password successful:', loginRes2.data.error === false);

        // Resetting password back for future tests
        console.log('\n--- 6. Resetting password back to original ---');
        const newToken = loginRes2.data.data.token;
        await axios.put(`${baseUrl}/account/update-profile`, {
            senhaAtual: 'newpassword123',
            novaSenha: password
        }, { headers: { Authorization: `Bearer ${newToken}` } });
        console.log('Password reset back to original.');

    } catch (error) {
        console.error('Test failed:', error.response ? error.response.data : error.message);
    }
}

testPasswordUpdate();
