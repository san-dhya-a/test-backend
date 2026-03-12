const axios = require('axios');

const baseUrl = 'http://localhost:5000/api/auth';
const accountUrl = 'http://localhost:5000/api/account';

async function testFlow() {
    console.log('--- Starting Flow Test ---');
    
    const timestamp = Date.now();
    const testUser = {
        cargo: 'Test Cargo',
        nomeCompleto: 'Test User ' + timestamp,
        cpfCnpj: '123.456.789-00',
        email: 'test' + timestamp + '@example.com',
        password: 'password123',
        endereco: 'Test Street',
        numero: '123',
        uf: 'TS',
        genero: 'Homem'
    };

    try {
        // 1. Register
        console.log('1. Testing Registration...');
        const regRes = await axios.post(`${baseUrl}/register`, testUser);
        console.log('Registration Status:', regRes.status);
        console.log('Registration Message:', regRes.data.message);

        // 2. Login
        console.log('\n2. Testing Login...');
        const loginRes = await axios.post(`${baseUrl}/login`, {
            email: testUser.email,
            password: testUser.password
        });
        console.log('Login Status:', loginRes.status);
        const token = loginRes.data.data.token;
        console.log('Token received:', token ? 'Yes' : 'No');

        // 3. Profile
        console.log('\n3. Testing Profile Retrieval...');
        const profRes = await axios.get(`${accountUrl}/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Profile Status:', profRes.status);
        const data = profRes.data.data;
        console.log('Profile Data Received:', JSON.stringify(data, null, 2));
        const success = (
            data.nomeCompleto === testUser.nomeCompleto && 
            data.cpfCnpj === testUser.cpfCnpj &&
            data.endereco === testUser.endereco &&
            data.genero === testUser.genero
        );

        if (success) {
            console.log('\n✅ SUCCESS: Profile data matches registration data with Portuguese columns.');
            console.log('Verified Fields: nomeCompleto, cpfCnpj, endereco, genero');
        } else {
            console.log('\n❌ FAILURE: Profile data mismatch or missing fields.');
            console.log('Expected Name:', testUser.nomeCompleto, '| Got:', data.nomeCompleto);
            console.log('Expected Gender:', testUser.genero, '| Got:', data.genero);
            console.log('Expected Address:', testUser.endereco, '| Got:', data.endereco);
        }

    } catch (error) {
        console.error('\n❌ TEST ERROR:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

testFlow();
