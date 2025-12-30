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
