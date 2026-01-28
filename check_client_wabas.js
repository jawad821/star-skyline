require('dotenv').config();
const https = require('https');
const fs = require('fs');

const token = "EAAUXPPQl6BYBQhsJQnjdg7UNWIHrjLZCZCvJRXZAR1zOd2Wb1bCbWlUzLEHdfgvJu5gXvs3mLdZCPthg6YN7hRC2ZA4vTaZA1SuoxuzQilRtpTTyrMtNmPjIPpWh3jAyC8l2005J1TuPOEXWio9fhQWZAQ8g9bIcYa8YtuGuwuhYnYzl7YCNHEOcuO5lNjuZAKR7twZDZD";

const options = {
    hostname: 'graph.facebook.com',
    path: `/v22.0/me/client_whatsapp_business_accounts?fields=id,name,phone_numbers{display_phone_number,id,name_status}`,
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`
    }
};

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
