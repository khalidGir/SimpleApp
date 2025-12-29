const cron = require('node-cron');
const { sendAlert } = require('./alerts');

// In-memory store for URLs
const monitoredUrls = new Set();

const addUrl = (url) => {
    monitoredUrls.add(url);
    console.log(`Added ${url} to monitoring list.`);
};

const getUrls = () => {
    return Array.from(monitoredUrls);
};

const checkUrl = async (url) => {
    const start = Date.now();
    try {
        const response = await fetch(url);
        const duration = Date.now() - start;

        if (!response.ok) {
            await sendAlert(url, `Status Failure: ${response.status}`, `The URL returned status code ${response.status}. Response time: ${duration}ms.`);
        } else if (duration > 1000) {
            await sendAlert(url, `High Latency: ${duration}ms`, `The URL took ${duration}ms to respond, which exceeds the 1000ms threshold.`);
        } else {
            // Healthy, no action needed
            // console.log(`Checked ${url}: OK (${duration}ms)`);
        }
    } catch (error) {
        await sendAlert(url, `Network Error`, `Failed to fetch URL. Error: ${error.message}`);
    }
};

const startScheduler = () => {
    // Schedule task to run every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
        console.log('Running scheduled checks...');
        const urls = getUrls();
        if (urls.length === 0) {
            console.log('No URLs to monitor.');
            return;
        }

        for (const url of urls) {
            await checkUrl(url);
        }
    });
    console.log('Scheduler started: Checks every 5 minutes.');
};

module.exports = {
    addUrl,
    getUrls,
    startScheduler
};
