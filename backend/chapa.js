const axios = require('axios');
const crypto = require('crypto');

const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY;
const CHAPA_API_URL = 'https://api.chapa.co/v1';

const initializePayment = async (user, tx_ref) => {
    const payload = {
        amount: '100', // Fixed amount for Pro upgrade
        currency: 'ETB',
        email: user.email,
        first_name: 'User', // Placeholder or add to User model if available
        last_name: user.id.toString(),
        tx_ref: tx_ref,
        callback_url: `${process.env.API_URL}/chapa/webhook`, // Webhook URL
        return_url: `${process.env.FRONTEND_URL}/dashboard?upgrade=success`, // Frontend return URL
        customization: {
            title: 'Upgrade to Pro',
            description: 'Unlock 50 URLs and 1-minute checks',
        },
        meta: {
            user_id: user.id
        }
    };

    try {
        const response = await axios.post(`${CHAPA_API_URL}/transaction/initialize`, payload, {
            headers: {
                'Authorization': `Bearer ${CHAPA_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Chapa initialization error:', error.response ? error.response.data : error.message);
        throw new Error('Payment initialization failed');
    }
};

const verifySignature = (signature, body) => {
    const hash = crypto.createHmac('sha256', CHAPA_SECRET_KEY).update(JSON.stringify(body)).digest('hex');
    return hash === signature;
};

module.exports = { initializePayment, verifySignature };
