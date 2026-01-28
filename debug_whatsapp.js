const https = require('https');

const token = "EAAMVeMPZAWZBoBQrvQUbobM1GvByK8ZCzbGfRLh0uLhLeydjqIngheWjVAcVzZAGblXiQ2zjPZCDZAtreAhiYnlaSVZCmY2Wlp17Giopn8G0MSG9ZBwEEHloiT6rci9kGfOxLys9y9b0JYxNnhsV8JsqjJyjpKlOXikOT2t5zcWyqhEwlYCm9WQ2p4R47Hm4cB1g0QZDZD";
const phoneId = "885921134615257";
const wabaId = "1951262062413464";

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
    console.log(`GET https://graph.facebook.com${path}`);

    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            console.log(`Status: ${res.statusCode}`);
            try {
                const json = JSON.parse(data);
                console.log('Response:', JSON.stringify(json, null, 2));
            } catch (e) {
                console.log('Body:', data);
            }
        });
    });
    req.on('error', e => console.error(e));
    req.end();
}

// 1. Check Token Owner
makeRequest('/v17.0/me?fields=id,name', 'Token Owner Check');

// 2. Check WABA ID
makeRequest(`/v17.0/${wabaId}?fields=id,name,timezone_id,message_template_namespace`, 'WABA ID Check');

// 3. Check Phone Number ID
makeRequest(`/v17.0/${phoneId}?fields=id,display_phone_number,name_status,quality_rating,code_verification_status`, 'Phone Number ID Check');

// 4. List Phone Numbers attached to WABA
makeRequest(`/v17.0/${wabaId}/phone_numbers`, 'WABA Phone Numbers List');
