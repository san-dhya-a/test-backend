const axios = require('axios');
const baseUrl = 'http://localhost:5002/api';

async function runFullVerification() {
    const timestamp = Date.now();
    const email = `verify_${timestamp}@example.com`;
    const password = 'originalPassword123';
    const newPassword = 'newPassword456';
    let token = '';

    try {
        console.log(`--- [1] Registering: ${email} ---`);
        await axios.post(`${baseUrl}/auth/register`, {
            nomeCompleto: 'Verification User',
            email,
            password,
            cpfCnpj: '12345678901',
            cep: '69500000',
            endereco: 'Rua de Teste',
            numero: '99',
            uf: 'RJ',
            cidade: 'Rio',
            bairro: 'Centro',
            telefoneCelular: '21999999999',
            genero: 'Mulher'
        });
        console.log('Register: OK');

        console.log('\n--- [2] Logging in ---');
        const loginRes1 = await axios.post(`${baseUrl}/auth/login`, { email, password });
        token = loginRes1.data.data.token;
        console.log('Login: OK');

        const config = { headers: { Authorization: `Bearer ${token}` } };

        console.log('\n--- [3] Profile Update (NO password fields) ---');
        const updateRes1 = await axios.put(`${baseUrl}/account/update-profile`, {
            complemento: 'Apto 101'
        }, config);
        console.log('Update (No Pwd):', updateRes1.data.success ? 'OK' : 'FAILED');

        console.log('\n--- [4] Profile Update (Mismatched passwords - Should be caught by schema, but checking backend) ---');
        // Note: The frontend schema (Zod) would catch this, so we are testing backend behavior if it bypasses frontend
        try {
            await axios.put(`${baseUrl}/account/update-profile`, {
                senhaAtual: password,
                novaSenha: newPassword,
                confirmarNovaSenha: 'wrongMatch'
            }, config);
            console.log('Update (Mismatched): Unexpectedly PASSED');
        } catch (e) {
            console.log('Update (Mismatched): Caught (Expected)');
        }

        console.log('\n--- [5] Profile Update (WRONG current password) ---');
        try {
            await axios.put(`${baseUrl}/account/update-profile`, {
                senhaAtual: 'wrongPreviousPwd',
                novaSenha: newPassword
            }, config);
            console.log('Update (Wrong Curr Pwd): Unexpectedly PASSED');
        } catch (e) {
            console.log('Update (Wrong Curr Pwd):', e.response.data.message, '(Expected)');
        }

        console.log('\n--- [6] Profile Update (CORRECT password change) ---');
        const updateRes2 = await axios.put(`${baseUrl}/account/update-profile`, {
            senhaAtual: password,
            novaSenha: newPassword
        }, config);
        console.log('Update (Pwd Change):', updateRes2.data.success ? 'OK' : 'FAILED');

        console.log('\n--- [7] Logging in with NEW password ---');
        const loginRes2 = await axios.post(`${baseUrl}/auth/login`, { email, password: newPassword });
        console.log('Login (New Pwd):', loginRes2.data.error === false ? 'OK' : 'FAILED');

        console.log('\n--- ALL STEPS COMPLETED ---');

    } catch (error) {
        console.error('\n!!! TEST FAILED !!!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
        process.exit(1);
    }
}

runFullVerification();
