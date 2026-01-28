require('dotenv').config();
const https = require('https');
const fs = require('fs');

const token = process.env.WHATSAPP_API_TOKEN;
const wabaId = process.env.WHATSAPP_WABA_ID;

const options = {
    hostname: 'graph.facebook.com',
    path: `/v22.0/${wabaId}/message_templates/booking_assigned_driver`,
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`
    }
};

console.log('Fetching booking_assigned_driver template details...');

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            fs.writeFileSync('driver_template_details.json', JSON.stringify(json, null, 2));
            console.log('Saved to driver_template_details.json');
            console.log(JSON.stringify(json, null, 2));
        } catch (e) {
            console.log('Error:', data);
        }
    });
});

req.on('error', e => console.error(e));
req.end();
