const express = require('express');
const app = require('./index'); // This might not work if index.js doesn't export app

// Let's create a specialized diagnostic script that imports the routes
const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const accountRoutes = require('./routes/accountRoutes');

const testApp = express();
testApp.use('/api', authRoutes);
testApp.use('/api/contact', contactRoutes);
testApp.use('/api/account', accountRoutes);

function printRoutes(path, layer) {
  if (layer.route) {
    layer.route.stack.forEach(printRoutes.bind(null, path + (path.endsWith('/') ? '' : '/') + layer.route.path));
  } else if (layer.name === 'router' && layer.handle.stack) {
    layer.handle.stack.forEach(printRoutes.bind(null, path + (path.endsWith('/') ? '' : '/') + (layer.regexp.source.replace('\\/?(?=\\/|$)', '').replace('^\\/', '').replace(/\\\//g, '/'))));
  } else if (layer.method) {
    console.log('%s %s', layer.method.toUpperCase(), path);
  }
}

console.log('--- REGISTERED ROUTES ---');
testApp._router.stack.forEach(printRoutes.bind(null, ''));
console.log('-------------------------');
