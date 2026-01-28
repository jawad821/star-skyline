require('dotenv').config();
const https = require('https');
const fs = require('fs');

const token = process.env.WHATSAPP_API_TOKEN;
const wabaId = process.env.WHATSAPP_WABA_ID;

const options = {
    hostname: 'graph.facebook.com',
    path: `/v22.0/${wabaId}/message_templates?fields=name,status,language`,
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`
    }
};

console.log(`Fetching templates for WABA: ${wabaId}`);

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            fs.writeFileSync('waba_templates.json', JSON.stringify(json, null, 2));
            console.log('Saved to waba_templates.json');

            if (json.data) {
                console.log(`Found ${json.data.length} templates.`);
                json.data.forEach(t => console.log(`- ${t.name} (${t.language}) [${t.status}]`));
            }
        } catch (e) {
            console.log('Error parsing JSON');
        }
    });
});

req.on('error', e => console.error(e));
req.end();
