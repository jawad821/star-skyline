require('dotenv').config();
const https = require('https');
const fs = require('fs');

const token = "EAAUXPPQl6BYBQhsJQnjdg7UNWIHrjLZCZCvJRXZAR1zOd2Wb1bCbWlUzLEHdfgvJu5gXvs3mLdZCPthg6YN7hRC2ZA4vTaZA1SuoxuzQilRtpTTyrMtNmPjIPpWh3jAyC8l2005J1TuPOEXWio9fhQWZAQ8g9bIcYa8YtuGuwuhYnYzl7YCNHEOcuO5lNjuZAKR7twZDZD";
// The Old WABA ID from the original .env
const wabaId = "1951262062413464";

const options = {
    hostname: 'graph.facebook.com',
    path: `/v22.0/${wabaId}/phone_numbers?fields=display_phone_number,id,name_status,quality_rating,code_verification_status`,
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
            fs.writeFileSync('check_old_waba.json', JSON.stringify(json, null, 2));
            console.log('Saved to check_old_waba.json');
        } catch (e) {
            console.log('Error parsing JSON');
        }
    });
});

req.on('error', e => console.error(e));
req.end();
