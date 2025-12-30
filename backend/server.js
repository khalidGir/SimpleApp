const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');
const { addUrl, startScheduler } = require('./schedule');
const { sendAlert } = require('./alerts');

const app = express();
const PORT = process.env.PORT || 5000;
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors());
app.use(express.json());

// Start the cron scheduler
startScheduler();

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

app.post('/add-url', (req, res) => {
    const { url } = req.body;
    if (!url || typeof url !== 'string' || !url.startsWith('https://')) {
        return res.status(400).json({ error: 'Invalid URL. Must start with https://' });
    }
    
    addUrl(url);
    res.json({ message: 'URL added to monitoring list', url });
});

app.post('/check', async (req, res) => {
    if (process.env.ENABLE_CHECK_ENDPOINT !== 'true') {
        return res.status(403).json({ 
            error: 'Check endpoint is disabled', 
            timestamp: new Date().toISOString() 
        });
    }

    const { url, name } = req.body;

    if (!url || typeof url !== 'string' || !url.startsWith('https://')) {
        return res.status(400).json({ error: 'Invalid URL. Must start with https://' });
    }

    const start = Date.now();
    try {
        const response = await fetch(url);
        const duration = Date.now() - start;
        const success = response.ok;
        const status = response.status;
        const checkName = name || 'Manual Check';

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
        const checkName = name || 'Manual Check';
        await sendAlert(
            url,
            `ALERT: ${checkName} Network Error`,
            `URL: ${url}\nError: ${error.message}\nTime: ${new Date().toISOString()}`
        );
        
        res.status(500).json({
            error: 'Failed to fetch URL',
            details: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

app.get('/test-email', async (req, res) => {
    try {
        if (!process.env.RESEND_API_KEY || !process.env.ALERT_EMAIL) {
            return res.status(400).json({ ok: false, error: 'Resend API Key or Alert Email not set' });
        }

        await resend.emails.send({
            from: 'SimpleApp <onboarding@resend.dev>',
            to: process.env.ALERT_EMAIL,
            subject: 'SimpleApp test email',
            text: 'Email system (Resend) is working.',
        });

        res.json({ ok: true });
    } catch (error) {
        console.error('Email test failed:', error);
        res.status(500).json({ ok: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
