const axios = require('axios');
const baseUrl = 'http://localhost:5000/api';
const token = 'eyJhbGciOiJIUzI1NiIsIInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcyLCJlbWFpbCI6Im1hbnVhbF90ZXN0XzE3NzMzODQ2MDYyNDBAZXhhbXBsZS5jb20iLCJub21lQ29tcGxldG8iOiJNYW51YWwgVGVzdCIsImlhdCI6MTc3MzM4NDYxMSwiZXhwIjoxNzczNDcxMDExfQ.XFwCxcqM0FjSPLU6azSbDDfNhLBiX';

axios.put(`${baseUrl}/account/update-profile`, {
    nomeCompleto: 'Manual Test Updated Node',
    complemento: 'Room 404'
}, {
    headers: { Authorization: `Bearer ${token}` }
}).then(r => {
    console.log('SUCCESS:', r.data);
}).catch(e => {
    console.log('FAILURE:', e.response ? e.response.data : e.message);
});
