const express = require('express');
const router = express.Router();

// WhatsApp webhook verification token (must match what you set in Meta dashboard)
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'skyline_verify_token';

/**
 * GET /api/webhook - Webhook verification endpoint
 * Meta will call this to verify your webhook
 */
router.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    console.log('📞 [WEBHOOK] Verification request received');
    console.log('   Mode:', mode);
    console.log('   Token:', token);
    console.log('   Challenge:', challenge);

    // Check if mode and token are correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('✅ [WEBHOOK] Verification successful!');
        // Respond with the challenge token from the request
        res.status(200).send(challenge);
    } else {
        console.log('❌ [WEBHOOK] Verification failed - invalid token');
        res.sendStatus(403);
    }
});

/**
 * POST /api/webhook - Receive incoming WhatsApp messages
 * Meta will send incoming messages, status updates, etc. to this endpoint
 */
router.post('/webhook', async (req, res) => {
    console.log('📨 [WEBHOOK] Incoming webhook event');
    console.log(JSON.stringify(req.body, null, 2));

    try {
        const body = req.body;

        // Check if this is a WhatsApp message event
        if (body.object === 'whatsapp_business_account') {
            // Extract message details
            const entry = body.entry?.[0];
            const changes = entry?.changes?.[0];
            const value = changes?.value;

            if (value?.messages) {
                const message = value.messages[0];
                const from = message.from; // Customer/Driver phone number
                const messageType = message.type;

                let messageBody = '';
                let buttonId = '';

                if (messageType === 'text') {
                    messageBody = message.text?.body;
                } else if (messageType === 'interactive') {
                    const interactive = message.interactive;
                    if (interactive.type === 'button_reply') {
                        messageBody = interactive.button_reply.title;
                        buttonId = interactive.button_reply.id;
                    }
                }

                console.log('📩 [WEBHOOK] New message received');
                console.log('   From:', from);
                console.log('   Type:', messageType);
                console.log('   Message:', messageBody);
                console.log('   Button ID:', buttonId);

                // Handle Driver Response (Accept/Reject)
                if (messageType === 'interactive') {
                    const notificationService = require('../services/notificationService');
                    if (messageBody.toLowerCase().includes('reject') || buttonId.includes('reject')) {
                        // Driver rejected
                        await notificationService.handleDriverResponse(from, 'reject', buttonId);
                    } else if (messageBody.toLowerCase().includes('accept') || buttonId.includes('accept')) {
                        // Driver accepted
                        await notificationService.handleDriverResponse(from, 'accept', buttonId);
                    }
                }
            }

            if (value?.statuses) {
                const status = value.statuses[0];
                console.log('📊 [WEBHOOK] Message status update');
                console.log('   Message ID:', status.id);
                console.log('   Status:', status.status);
                console.log('   Timestamp:', status.timestamp);

                // TODO: Update message delivery status in your database
            }
        }

        // Always respond with 200 OK to acknowledge receipt
        res.sendStatus(200);
    } catch (error) {
        console.error('❌ [WEBHOOK] Error processing webhook:', error);
        res.sendStatus(500);
    }
});

module.exports = router;
