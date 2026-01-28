require('dotenv').config();
const https = require('https');

const token = process.env.WHATSAPP_API_TOKEN;
const phoneId = process.env.WHATSAPP_PHONE_ID;
const to = "923212236688";

const postData = JSON.stringify({
    messaging_product: "whatsapp",
    to: to,
    type: "template",
    template: {
        name: "hello_world",
        language: { code: "en_US" }
    }
});

const options = {
    hostname: 'graph.facebook.com',
    path: `/v22.0/${phoneId}/messages`,
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': postData.length
    }
};

console.log(`Sending to ${to} via PhoneID ${phoneId}...`);

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
