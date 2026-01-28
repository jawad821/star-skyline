require('dotenv').config();
const https = require('https');

const token = process.env.WHATSAPP_API_TOKEN;
const phoneId = process.env.WHATSAPP_PHONE_ID;
const to = "923072189005";

// Try sending PLAIN TEXT (this should fail)
const postData = JSON.stringify({
    messaging_product: "whatsapp",
    to: to,
    type: "text",
    text: {
        preview_url: false,
        body: "Test plain text message"
    }
});

const options = {
    hostname: 'graph.facebook.com',
    path: `/v22.0/${phoneId}/messages`,
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': postData.length
    }
};

console.log(`Attempting to send PLAIN TEXT to ${to}...`);

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        try {
            const json = JSON.parse(data);
            console.log('Response:', JSON.stringify(json, null, 2));

            if (json.error) {
                console.log('\n❌ ERROR DETECTED:');
                console.log('Error Code:', json.error.code);
                console.log('Error Message:', json.error.message);
            }
        } catch (e) {
            console.log('Body:', data);
        }
    });
});

req.on('error', e => console.error(e));
req.write(postData);
req.end();
