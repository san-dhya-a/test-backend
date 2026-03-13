const axios = require('axios');

async function verifyPasswordFlow() {
    const baseUrl = 'http://localhost:5000/api';
    const email = `test_pass_${Date.now()}@example.com`;
    const originalPassword = 'password123';
    const newPassword = 'newpassword456';

    try {
        console.log('--- 1. Registering new test user ---');
        await axios.post(`${baseUrl}/auth/register`, {
            nomeCompleto: 'Pass Test User',
            email: email,
            password: originalPassword,
            cpfCnpj: '12345678901',
            cep: '69500000',
            endereco: 'Rua Teste',
            numero: '123',
            uf: 'AM',
            cidade: 'Coari',
            bairro: 'Centro',
            telefoneCelular: '92999999999',
            genero: 'Masculino'
        });
        console.log(`User ${email} registered.`);

        console.log('\n--- 2. Logging in ---');
        const loginRes = await axios.post(`${baseUrl}/auth/login`, { email, password: originalPassword });
        const token = loginRes.data.data.token;
        console.log('Login successful.');

        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        console.log('\n--- 3. Updating profile WITHOUT password ---');
        const updateRes1 = await axios.put(`${baseUrl}/account/update-profile`, {
            nomeCompleto: 'Pass Test User Updated',
            complemento: 'Apto 101'
        }, config);
        console.log('Update status:', updateRes1.data.success);
        console.log('Message:', updateRes1.data.message);

        console.log('\n--- 4. Updating password with INCORRECT current password ---');
        try {
            await axios.put(`${baseUrl}/account/update-profile`, {
                senhaAtual: 'wrongpassword',
                novaSenha: newPassword
            }, config);
        } catch (err) {
            console.log('Expected error (Wrong current password):', err.response.data.message);
        }

        console.log('\n--- 5. Updating password with CORRECT current password ---');
        const updateRes2 = await axios.put(`${baseUrl}/account/update-profile`, {
            senhaAtual: originalPassword,
            novaSenha: newPassword
        }, config);
        console.log('Update password status:', updateRes2.data.success);

        console.log('\n--- 6. Verifying login with NEW password ---');
        const loginRes2 = await axios.post(`${baseUrl}/auth/login`, { email, password: newPassword });
        console.log('Login with new password successful:', loginRes2.data.error === false);

    } catch (error) {
        if (error.response) {
            console.error('Test failed with status:', error.response.status);
            console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Test failed:', error.message);
        }
    }
}

verifyPasswordFlow();
