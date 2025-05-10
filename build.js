const fs = require('fs');
const path = require('path');

// Load API key from environment or .env file
const apiKey = process.env.GOOGLE_MAPS_API_KEY || 'YOUR_PRODUCTION_API_KEY';

// Path to config.js
const configPath = path.join(__dirname, 'public', 'js', 'config.js');

// Read the config file
let configContent = fs.readFileSync(configPath, 'utf8');

// Replace the API key
configContent = configContent.replace('YOUR_API_KEY_HERE', apiKey);

// Write the updated config
fs.writeFileSync(configPath, configContent);

console.log('Config file updated with production API key');