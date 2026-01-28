const https = require('https');

// Credentials from .env
const token = "EAAMVeMPZAWZBoBQrvQUbobM1GvByK8ZCzbGfRLh0uLhLeydjqIngheWjVAcVzZAGblXiQ2zjPZCDZAtreAhiYnlaSVZCmY2Wlp17Giopn8G0MSG9ZBwEEHloiT6rci9kGfOxLys9y9b0JYxNnhsV8JsqjJyjpKlOXikOT2t5zcWyqhEwlYCm9WQ2p4R47Hm4cB1g0QZDZD";
const phoneId = "885921134615257";

console.log(`Testing WhatsApp Connection...`);
console.log(`Phone ID: ${phoneId}`);
console.log(`Token Prefix: ${token.substring(0, 10)}...`);

const options = {
    hostname: 'graph.facebook.com',
    path: `/v17.0/${phoneId}?fields=id,display_phone_number,name,quality_rating`,
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
};

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        console.log('\nResponse Status:', res.statusCode);
        console.log('Response Body:', JSON.parse(data));
    });
});

req.on('error', (e) => {
    console.error('Request Error:', e);
});

req.end();
