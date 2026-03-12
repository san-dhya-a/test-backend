const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testContactSubmit() {
    const url = 'http://localhost:5000/api/contact';
    const form = new FormData();

    form.append('name', 'Antigravity Test');
    form.append('email', 'test@example.com');
    form.append('cpf_cnpj', '123.456.789-00');
    form.append('message', 'This is a test message from the AI.');
    
    // Create a dummy file for testing
    const testFileDir = path.join(__dirname, 'test_files');
    if (!fs.existsSync(testFileDir)) {
        fs.mkdirSync(testFileDir);
    }
    const testFilePath = path.join(testFileDir, 'test_contact.txt');
    fs.writeFileSync(testFilePath, 'Sample file content for contact form test.');
    
    form.append('file', fs.createReadStream(testFilePath));

    try {
        console.log('Sending contact submission...');
        const response = await axios.post(url, form, {
            headers: form.getHeaders(),
        });

        console.log('Response Status:', response.status);
        console.log('Response Data:', JSON.stringify(response.data, null, 2));

        if (response.data.success) {
            console.log('SUCCESS: Contact record created.');
        } else {
            console.log('FAILURE: API returned success=false');
        }
    } catch (error) {
        console.error('Test failed:', error.response ? error.response.data : error.message);
    } finally {
        // Cleanup test file
        // fs.unlinkSync(testFilePath);
    }
}
testContactSubmit();
