require('dotenv').config();
const https = require('https');
const fs = require('fs');

const token = process.env.WHATSAPP_API_TOKEN;
const wabaId = process.env.WHATSAPP_WABA_ID;

const options = {
    hostname: 'graph.facebook.com',
    path: `/v17.0/${wabaId}/phone_numbers?fields=display_phone_number,id,name_status,quality_rating`,
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`
    }
};

console.log(`Fetching numbers for WABA: ${wabaId}`);

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            fs.writeFileSync('phone_numbers.json', JSON.stringify(json, null, 2));
            console.log('Saved to phone_numbers.json');
        } catch (e) {
            console.log('Error parsing JSON');
            fs.writeFileSync('phone_numbers_raw.txt', data);
        }
    });
});

req.on('error', e => console.error(e));
req.end();
