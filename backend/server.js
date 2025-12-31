const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');
const { addUrl, startScheduler } = require('./schedule');
const { sendAlert } = require('./alerts');
const { initDb, createUser, findUserByEmail, getUserUrls } = require('./db');
const { hashPassword, comparePassword, generateToken, authenticateToken } = require('./auth');

const app = express();
const PORT = process.env.PORT || 5000;
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors());
app.use(express.json());

// Initialize DB and start scheduler
initDb();
startScheduler();

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
        res.status(500).json({ error: 'Failed to add URL to database' });
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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
