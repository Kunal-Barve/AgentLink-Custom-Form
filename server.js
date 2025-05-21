const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Twilio configuration - made optional
let client = null;
let verifySid = null;

try {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        verifySid = process.env.TWILIO_VERIFY_SID;
        client = twilio(accountSid, authToken);
        console.log('Twilio client initialized successfully');
    } else {
        console.log('Twilio credentials not properly configured or missing. Twilio features will be disabled.');
    }
} catch (error) {
    console.error('Error initializing Twilio client:', error);
    console.log('Twilio features will be disabled.');
}

// Send verification code
app.post('/api/send-verification', async (req, res) => {
    try {
        if (!client) {
            return res.status(503).json({ 
                success: false, 
                message: 'Twilio service not configured' 
            });
        }
        
        const { phone } = req.body;
        
        const verification = await client.verify.v2
            .services(verifySid)
            .verifications.create({ to: phone, channel: 'sms' });
        
        res.json({ success: true, status: verification.status });
    } catch (error) {
        console.error('Error sending verification:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to send verification code' 
        });
    }
});

// Verify code
app.post('/api/verify-code', async (req, res) => {
    try {
        if (!client) {
            return res.status(503).json({ 
                success: false, 
                message: 'Twilio service not configured' 
            });
        }
        
        const { phone, code } = req.body;
        
        const verificationCheck = await client.verify.v2
            .services(verifySid)
            .verificationChecks.create({ to: phone, code });
        
        if (verificationCheck.status === 'approved') {
            res.json({ success: true, status: verificationCheck.status });
        } else {
            res.json({ 
                success: false, 
                message: 'Invalid verification code',
                status: verificationCheck.status
            });
        }
    } catch (error) {
        console.error('Error verifying code:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to verify code' 
        });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// Add a route for the root path to inject API key
app.get('/', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'index.html');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading index.html:', err);
            return res.status(500).send('Error loading page');
        }
        
        // Replace the API key placeholder with the actual key from environment variables
        const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY';
        const html = data.replace('YOUR_API_KEY', googleMapsApiKey);
        
        res.send(html);
    });
});
