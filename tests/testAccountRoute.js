const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testUpdateProfile() {
    const url = 'http://localhost:5000/api/account/update-profile';
    const form = new FormData();

    // Mock form fields from Minha Conta
    form.append('cargo', 'PDV');
    form.append('nomeCompleto', 'Roberto da Silva Santos');
    form.append('cpfCnpj', '194.123.321-90');
    form.append('email', 'roberto@gmail.com');
    form.append('cep', '22222-111');
    form.append('endereco', 'Rua dos Ipês');
    form.append('numero', '345');
    form.append('dddCelular', '21');
    form.append('telefoneCelular', '99999-2334');
    form.append('genero', 'Homem');
    form.append('novaSenha', 'newpassword123');

    console.log('Sending test request to:', url);

    try {
        const response = await axios.post(url, form, {
            headers: {
                ...form.getHeaders(),
            },
        });

        console.log('Response Status:', response.status);
        console.log('Response Data:', JSON.stringify(response.data, null, 2));

        if (response.data.success && response.data.message === 'Profile updated successfully') {
            console.log('✅ Test Passed: Profile update successful with simplified response.');
        } else {
            console.log('❌ Test Failed:', response.data.message);
        }
    } catch (error) {
        if (error.response) {
            console.error('❌ Test Failed with status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('❌ Test Failed:', error.message);
        }
        console.log('\nMake sure the backend server (node index.js) is running on port 5000.');
    }
}

testUpdateProfile();
