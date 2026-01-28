require('dotenv').config();
const https = require('https');

// New Token provided by user
const token = "EAAUXPPQl6BYBQhsJQnjdg7UNWIHrjLZCZCvJRXZAR1zOd2Wb1bCbWlUzLEHdfgvJu5gXvs3mLdZCPthg6YN7hRC2ZA4vTaZA1SuoxuzQilRtpTTyrMtNmPjIPpWh3jAyC8l2005J1TuPOEXWio9fhQWZAQ8g9bIcYa8YtuGuwuhYnYzl7YCNHEOcuO5lNjuZAKR7twZDZD";

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
                const json = JSON.parse(data);
                if (label === 'Token Debug') {
                    console.log('Token Scopes:', json.data ? json.data.scopes : 'N/A');
                    console.log('Token App ID:', json.data ? json.data.app_id : 'N/A');
                } else {
                    console.log('Body:', JSON.stringify(json, null, 2));
                }
            } catch (e) {
                console.log('Body:', data);
            }
        });
    });
    req.on('error', e => console.error(e));
    req.end();
}

// 1. Check Token Info (Permissions)
makeRequest('/debug_token?input_token=' + token, 'Token Debug');

// 2. Get Me (User ID)
makeRequest('/v22.0/me?fields=id,name', 'Token Owner');

// 3. Get Accounts/WABAs attached to this user
// This is a bit tricky, usually we check the WABA directly if we know it. 
// Let's assume the WABA ID is the same as before or try to find it via the Phone ID if we had one.
// Instead, let's try to query the WABA ID we found earlier (751642134666481) to see if this token has access.
makeRequest('/v22.0/751642134666481?fields=id,name,phone_numbers{display_phone_number,id,name_status,quality_rating,code_verification_status}', 'Check Permissions on Test WABA');
// Also check the other WABA ID we saw in the DB
makeRequest('/v22.0/1951262062413464?fields=id,name,phone_numbers{display_phone_number,id,name_status,quality_rating,code_verification_status}', 'Check Permissions on Old WABA');

