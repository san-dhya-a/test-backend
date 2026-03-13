const axios = require('axios');
const baseUrl = 'http://localhost:5000/api';
const email = `manual_test_${Date.now()}@example.com`;
const password = 'password123';

axios.post(`${baseUrl}/auth/register`, {
    nomeCompleto: 'Manual Test',
    email: email,
    password: password,
    cpfCnpj: '12345678901',
    cep: '69500000',
    endereco: 'Rua Manual',
    numero: '10',
    uf: 'SP',
    cidade: 'São Paulo',
    bairro: 'Centro',
    telefoneCelular: '11999999999',
    genero: 'Masculino'
}).then(() => {
    return axios.post(`${baseUrl}/auth/login`, { email, password });
}).then(r => {
    console.log('TOKEN:', r.data.data.token);
}).catch(e => {
    console.log(e.response ? e.response.data : e.message);
});
