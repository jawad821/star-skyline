require('dotenv').config();
const https = require('https');
const fs = require('fs');

const token = process.env.WHATSAPP_API_TOKEN;
const wabaId = process.env.WHATSAPP_WABA_ID;

const options = {
    hostname: 'graph.facebook.com',
    path: `/v22.0/${wabaId}/message_templates?fields=name,components,language,status&limit=50`,
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`
    }
};

console.log('Fetching all template details...');

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            fs.writeFileSync('all_templates_full.json', JSON.stringify(json, null, 2));
            console.log('Saved to all_templates_full.json');

            // Find driver template
            const driverTemplate = json.data?.find(t => t.name === 'booking_assigned_driver');
            if (driverTemplate) {
                console.log('\n=== DRIVER TEMPLATE ===');
                console.log(JSON.stringify(driverTemplate, null, 2));
            }
        } catch (e) {
            console.log('Error:', data);
        }
    });
});

req.on('error', e => console.error(e));
req.end();
