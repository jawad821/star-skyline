require('dotenv').config();
const https = require('https');

const token = process.env.WHATSAPP_API_TOKEN;
const phoneId = process.env.WHATSAPP_PHONE_ID; // 8859...

const postData = JSON.stringify({
    messaging_product: "whatsapp",
    pin: "123456"
});

const options = {
    hostname: 'graph.facebook.com',
    path: `/v22.0/${phoneId}/register`,
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': postData.length
    }
};

console.log(`Registering PhoneID ${phoneId}...`);

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        try {
            console.log('Body:', JSON.stringify(JSON.parse(data), null, 2));
        } catch (e) {
            console.log('Body:', data);
        }
    });
});

req.on('error', e => console.error(e));
req.write(postData);
req.end();
