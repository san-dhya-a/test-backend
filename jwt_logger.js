const fs = require('fs');
const path = require('path');

const logPath = path.join(__dirname, 'jwt_debug.log');

function logJwt(message) {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logPath, `[${timestamp}] ${message}\n`);
}

module.exports = logJwt;
