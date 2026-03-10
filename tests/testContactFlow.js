const axios = require('axios');

async function verifyContactFlow() {
    const baseUrl = 'http://localhost:5000/api';
    const email = `test_contact_${Date.now()}@example.com`;
    const password = 'password123';

    try {
        console.log('--- Step 1: Register New User ---');
        await axios.post(`${baseUrl}/auth/register`, {
            email,
            password,
            full_name: 'Contact Test User',
            cpf_cnpj: '987.654.321-00'
        });
        console.log('✅ Registration successful');

        console.log('\n--- Step 2: Login ---');
        const loginRes = await axios.post(`${baseUrl}/auth/login`, {
            email,
            password
        });
        const token = loginRes.data.data.token;
        console.log('✅ Login successful');

        console.log('\n--- Step 3: Submit Contact Request ---');
        const contactRes = await axios.post(`${baseUrl}/contact`, {
            name: 'Contact Test User',
            email: email,
            phone: '123456789',
            subject: 'Test Subject',
            message: 'This is a test message for the new contact flow.'
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('✅ Contact Submission Response:', JSON.stringify(contactRes.data, null, 2));

        if (contactRes.data.success) {
            console.log('\n✨ SUCCESS: Contact flow verified successfully.');
        } else {
            console.error('\n❌ FAILURE: Contact submission failed:', contactRes.data.message);
            process.exit(1);
        }

    } catch (error) {
        console.error('❌ Error during verification:', error.response?.data || error.message);
        process.exit(1);
    }
}

verifyContactFlow();
