require('dotenv').config();
const https = require('https');

const token = process.env.WHATSAPP_API_TOKEN;
const phoneId = process.env.WHATSAPP_PHONE_ID;
const to = "923212236688";

const postData = JSON.stringify({
    messaging_product: "whatsapp",
    to: to,
    type: "template",
    template: {
        name: "booking_confirmed_customer",
        language: { code: "en" },
        components: [
            {
                type: "body",
                parameters: [
                    { type: "text", text: "TEST_USER" },      // {{1}}
                    { type: "text", text: "TEST_REF" },       // {{2}}
                    { type: "text", text: "TEST_TIME" },      // {{3}}
                    { type: "text", text: "TEST_PICKUP" },    // {{4}}
                    { type: "text", text: "TEST_DROPOFF" },   // {{5}}
                    { type: "text", text: "TEST_DRIVER" },    // {{6}}
                    { type: "text", text: "TEST_PLATE" }      // {{7}}
                ]
            }
        ]
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

console.log(`Sending 'booking_confirmed_customer' to ${to} via PhoneID ${phoneId}...`);

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        try {
            console.log('Body:', JSON.stringify(JSON.parse(data), null, 2));
        } catch (e) {
            console.log('Body:', data);
        }
    });
});

req.on('error', e => console.error(e));
req.write(postData);
req.end();
