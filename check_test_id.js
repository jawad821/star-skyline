require('dotenv').config();
const https = require('https');

const token = process.env.WHATSAPP_API_TOKEN;
const potentialTestId = "122107418013224471";

const options = {
    hostname: 'graph.facebook.com',
    path: `/v17.0/${potentialTestId}?fields=display_phone_number,name_status,quality_rating`,
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`
    }
};

console.log(`Checking ID: ${potentialTestId}`);

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log(JSON.stringify(json, null, 2));
        } catch (e) {
            console.log(data);
        }
    });
});

req.on('error', e => console.error(e));
req.end();
