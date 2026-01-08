const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');
const { addUrl, startScheduler } = require('./schedule');
const { sendAlert } = require('./alerts');
const { initDb, createUser, findUserByEmail, getUserUrls, upgradeUserToPro, findUserById } = require('./db');
const { hashPassword, comparePassword, generateToken, authenticateToken } = require('./auth');
const { initializePayment, verifySignature } = require('./chapa');

const app = express();
const PORT = process.env.PORT || 5000;
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors());
app.use(express.json());

// Initialize DB (ensure tables exist)
initDb();
// Note: Scheduler is now run by worker.js

app.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = await findUserById(req.user.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        // Exclude password hash
        const { password_hash, ...profile } = user;
        res.json(profile);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

app.post('/create-checkout-session', authenticateToken, async (req, res) => {
    try {
        const tx_ref = `tx-${req.user.userId}-${Date.now()}`;
        // Using req.user from authenticateToken
        const checkoutInfo = await initializePayment({ 
            email: req.user.email, 
            id: req.user.userId 
        }, tx_ref);
        
        res.json({ checkoutUrl: checkoutInfo.data.checkout_url });
    } catch (error) {
        console.error('Checkout error:', error);
        res.status(500).json({ error: 'Failed to initiate payment' });
    }
});

app.post('/chapa/webhook', async (req, res) => {
    // Note: Signature verification ideally needs raw body
    // For now, checking status and meta
    const { status, tx_ref, meta } = req.body;
    
    console.log('Chapa Webhook received:', req.body);

    if (status === 'success' && meta && meta.user_id) {
        try {
            await upgradeUserToPro(meta.user_id, tx_ref);
            console.log(`User ${meta.user_id} upgraded to Pro via webhook`);
        } catch (error) {
            console.error('Failed to upgrade user via webhook', error);
            return res.status(500).send('Database update failed');
        }
    }
    
    res.status(200).send('OK');
});

app.get('/urls', authenticateToken, async (req, res) => {
    try {
        const urls = await getUserUrls(req.user.userId);
        res.json(urls);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch URLs' });
    }
});

app.post('/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await hashPassword(password);
        const user = await createUser(email, hashedPassword);
        res.status(201).json({ message: 'User created successfully', user: { id: user.id, email: user.email } });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed', details: error.message });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const isMatch = await comparePassword(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = generateToken(user);
        res.json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ error: 'Login failed', details: error.message });
    }
});

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

app.post('/add-url', authenticateToken, async (req, res) => {
    const { url } = req.body;
    if (!url || typeof url !== 'string' || !url.startsWith('https://')) {
        return res.status(400).json({ error: 'Invalid URL. Must start with https://' });
    }
    
    try {
        // Assuming default name for now, or could accept from body
        await addUrl(url, 'User Monitored', req.user.userId);
        res.json({ message: 'URL added to monitoring list', url });
    } catch (err) {
        if (err.message.includes('Limit reached')) {
            return res.status(403).json({ error: err.message });
        }
        res.status(500).json({ error: 'Failed to add URL to database', details: err.message });
    }
});

app.post('/check', authenticateToken, async (req, res) => {
    if (process.env.ENABLE_CHECK_ENDPOINT !== 'true') {
        return res.status(403).json({ 
            error: 'Check endpoint is disabled', 
            timestamp: new Date().toISOString() 
        });
    }

    const { url, name } = req.body;
    const checkName = name || 'Manual Check';

    if (!url || typeof url !== 'string' || !url.startsWith('https://')) {
        return res.status(400).json({ error: 'Invalid URL. Must start with https://' });
    }

    const start = Date.now();
    try {
        const response = await fetch(url);
        const duration = Date.now() - start;
        const status = response.status;
        const success = status >= 200 && status < 300;

        if (!success) {
            await sendAlert(
                url,
                `ALERT: ${checkName} is DOWN`,
                `URL: ${url}\nStatus: ${status}\nTime: ${new Date().toISOString()}`
            );
        }

        res.json({
            name: checkName,
            url: url,
            success: success,
            status: status,
            responseTimeMs: duration,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        const duration = Date.now() - start;
        await sendAlert(
            url,
            `ALERT: ${checkName} Network Error`,
            `URL: ${url}\nError: ${error.message}\nTime: ${new Date().toISOString()}`
        );
        
        res.json({
            name: checkName,
            url: url,
            success: false,
            status: "error",
            responseTimeMs: duration,
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = { app };
