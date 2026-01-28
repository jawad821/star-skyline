require('dotenv').config();
const https = require('https');
const fs = require('fs');

const token = "EAAUXPPQl6BYBQhsJQnjdg7UNWIHrjLZCZCvJRXZAR1zOd2Wb1bCbWlUzLEHdfgvJu5gXvs3mLdZCPthg6YN7hRC2ZA4vTaZA1SuoxuzQilRtpTTyrMtNmPjIPpWh3jAyC8l2005J1TuPOEXWio9fhQWZAQ8g9bIcYa8YtuGuwuhYnYzl7YCNHEOcuO5lNjuZAKR7twZDZD";

function makeRequest(path, label) {
    const options = {
        hostname: 'graph.facebook.com',
        path: path,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ label, data }));
        });
        req.on('error', reject);
        req.end();
    });
}

async function run() {
    const results = {};

    // 1. Get User Businesses / Ad Accounts / WABAs? 
    // Usually 'me/accounts' gives pages, 'me/businesses' gives business managers.
    // The best way to find WABAs is via the Business Manager, but we don't have that ID easily.
    // However, we can check 'me/ids_for_business' or granular scopes.

    // Let's try to get the 'Granular Scopes' from debug_token again, cleanly.
    try {
        const debug = await makeRequest(`/debug_token?input_token=${token}`, 'Debug');
        results.debug = JSON.parse(debug.data);
    } catch (e) { results.debug = "Error"; }

    // Let's try to list businesses directly if possible (often restricted)
    // Or we can assume the user IS a system user of a specific business.

    // Let's try checking the WABA ID '751642134666481' again but finding its OWNED numbers (maybe I missed something)
    // And '1951262062413464'.

    // What if the user is a System User? 
    // Let's check 'me'
    try {
        const me = await makeRequest('/v22.0/me?fields=id,name', 'Me');
        results.me = JSON.parse(me.data);
    } catch (e) { }

    // Let's Write to file
    fs.writeFileSync('token_deep_dive.json', JSON.stringify(results, null, 2));
    console.log('Saved token_deep_dive.json');
}

run();
