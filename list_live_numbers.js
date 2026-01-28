require('dotenv').config();
const https = require('https');
const fs = require('fs');

// New Token
const token = "EAAUXPPQl6BYBQhsJQnjdg7UNWIHrjLZCZCvJRXZAR1zOd2Wb1bCbWlUzLEHdfgvJu5gXvs3mLdZCPthg6YN7hRC2ZA4vTaZA1SuoxuzQilRtpTTyrMtNmPjIPpWh3jAyC8l2005J1TuPOEXWio9fhQWZAQ8g9bIcYa8YtuGuwuhYnYzl7YCNHEOcuO5lNjuZAKR7twZDZD";
// WABA from previous step (User seems to be using this WABA)
const wabaId = "751642134666481";

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
            fs.writeFileSync('live_numbers.json', JSON.stringify(json, null, 2));
            console.log('Saved to live_numbers.json');

            // Also print to console for quick check
            if (json.data) {
                json.data.forEach(n => {
                    console.log(`Number: ${n.display_phone_number} | ID: ${n.id} | Status: ${n.name_status} | Code: ${n.code_verification_status}`);
                });
            }
        } catch (e) {
            console.log('Error parsing JSON');
            console.log(data);
        }
    });
});

req.on('error', e => console.error(e));
req.end();
