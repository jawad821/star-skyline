require('dotenv').config();

if (process.env.RESEND_API_KEY) {
    console.log('RESEND_API_KEY is configured (Length: ' + process.env.RESEND_API_KEY.length + ')');
} else {
    console.log('RESEND_API_KEY is MISSING');
}
