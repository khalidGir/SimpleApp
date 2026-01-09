const axios = require('axios');
const crypto = require('crypto');

const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY;
const CHAPA_API_URL = 'https://api.chapa.co/v1';

const initializePayment = async (user, planType, tx_ref) => {
    let amount = '1000';
    let title = 'Pro Upgrade';
    
    if (planType === 'agency') {
        amount = '5000';
        title = 'Agency Upgrade';
    }

    const payload = {
        amount: amount, 
        currency: 'ETB',
        email: user.email,
        first_name: 'User', 
        last_name: user.id.toString(),
        tx_ref: tx_ref,
        callback_url: `${process.env.API_URL}/chapa/webhook`,
        return_url: `${process.env.FRONTEND_URL}/dashboard?upgrade=success`,
        customization: {
            title: title,
            description: `Upgrade to ${title}`,
        },
        meta: {
            user_id: user.id,
            plan_type: planType // Pass this to webhook
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
