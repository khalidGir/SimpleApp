const express = require('express');
const cors = require('cors');
const { addUrl, startScheduler } = require('./schedule');

const app = express();
const PORT = process.env.PORT || 5000;

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

        res.json({
            name: name || 'Manual Check',
            success: response.ok,
            status: response.status,
            responseTimeMs: duration,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch URL',
            details: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
