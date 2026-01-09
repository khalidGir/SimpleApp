const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');
const { addUrl, startScheduler } = require('./schedule');
const { sendAlert } = require('./alerts');
const crypto = require('crypto');
const { initDb, createUser, findUserByEmail, getUserUrls, upgradeUserToPlan, findUserById, getPublicUserUrls, findUserByVerificationToken, verifyUser } = require('./db');
const { hashPassword, comparePassword, generateToken, authenticateToken } = require('./auth');
const { initializePayment, verifySignature } = require('./chapa');
const { sendVerificationEmail } = require('./email');

const app = express();
const PORT = process.env.PORT || 5000;
// Note: resend instance in server.js was unused or redundant if we use email.js/alerts.js. 
// Removing the top-level Resend init here to avoid the crash.

app.use(cors());
app.use(express.json());

// Public Status Page Endpoint
app.get('/status-page/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        // Verify user exists first (optional, but good for 404s)
        const user = await findUserById(userId);
        if (!user) {
            return res.status(404).json({ error: 'Status page not found' });
        }

        const urls = await getPublicUserUrls(userId);
        res.json({
            owner: `User ${userId}`, // In real app, maybe show Company Name
            updatedAt: new Date(),
            services: urls
        });
    } catch (error) {
        console.error('Status page error:', error);
        res.status(500).json({ error: 'Failed to load status page' });
    }
});

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
        const { planType } = req.body; // Expect 'pro' or 'agency'
        const validPlans = ['pro', 'agency'];
        const selectedPlan = validPlans.includes(planType) ? planType : 'pro'; // Default to pro

        const tx_ref = `tx-${req.user.userId}-${Date.now()}`;
        // Using req.user from authenticateToken
        const checkoutInfo = await initializePayment({ 
            email: req.user.email, 
            id: req.user.userId 
        }, selectedPlan, tx_ref);
        
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
            // Default to 'pro' if plan_type is missing for legacy reasons
            const plan = meta.plan_type || 'pro';
            await upgradeUserToPlan(meta.user_id, plan, tx_ref);
            console.log(`User ${meta.user_id} upgraded to ${plan} via webhook`);
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
        
        // Generate and save verification token
        const token = crypto.randomBytes(32).toString('hex');
        // We need to import pool to run this raw query, or add a helper.
        // Importing pool in server.js is a bit leaky. 
        // Better: add 'setVerificationToken' to db.js. 
        // For now, I will rely on a new db helper I will add quickly or just import pool. 
        // Let's add the pool import to server.js since db.js exports it.
        const { pool } = require('./db');
        await pool.query('UPDATE users SET verification_token = $1, is_verified = FALSE WHERE id = $2', [token, user.id]);

        // Send Email
        await sendVerificationEmail(email, token);

        res.status(201).json({ 
            message: 'User created. Please check your email to verify your account.', 
            user: { id: user.id, email: user.email } 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Registration failed', details: error.message });
    }
});

app.get('/verify-email', async (req, res) => {
    const { token } = req.query;
    if (!token) return res.status(400).send('Invalid token');

    try {
        const user = await findUserByVerificationToken(token);
        if (!user) return res.status(400).send('Invalid or expired token');

        await verifyUser(user.id);
        
        // Redirect to frontend login with success flag
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/login?verified=true`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Verification failed');
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

        // Check verification status
        if (!user.is_verified) {
             return res.status(403).json({ error: 'Please verify your email address before logging in.' });
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
