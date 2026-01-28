require('dotenv').config();
const https = require('https');

const token = process.env.WHATSAPP_API_TOKEN;
const wabaId = process.env.WHATSAPP_WABA_ID;

function makeRequest(path, label) {
    const options = {
        hostname: 'graph.facebook.com',
        path: path,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };

    console.log(`\n--- ${label} ---`);
    console.log(`GET ${path}`);

    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            console.log(`Status: ${res.statusCode}`);
            try {
                console.log('Body:', JSON.stringify(JSON.parse(data), null, 2));
            } catch (e) {
                console.log('Body:', data);
            }
        });
    });
    req.on('error', e => console.error(e));
    req.end();
}

// Check WABA deep details
makeRequest(
    `/v17.0/${wabaId}?fields=id,name,currency,account_review_status,decision_maker_update,business_verification_status,status`,
    'WABA Deep Check'
);
