const cron = require('node-cron');
const { sendAlert } = require('./alerts');

// In-memory store for URLs
const monitoredUrls = [
  {
    name: 'Self health',
    url: 'https://simpleapp-gp8l.onrender.com/health'
  }
];

const addUrl = (url, name = 'Manual Check') => {
    monitoredUrls.push({ name, url });
    console.log(`Added ${url} to monitoring list.`);
};

const getUrls = () => {
    return monitoredUrls;
};

const checkUrl = async (entry) => {
    const { url, name } = entry;
    const start = Date.now();
    try {
        const response = await fetch(url);
        const duration = Date.now() - start;

        if (!response.ok) {
            await sendAlert(url, `Status Failure (${name}): ${response.status}`, `The URL returned status code ${response.status}. Response time: ${duration}ms.`);
        } else if (duration > 1000) {
            await sendAlert(url, `High Latency (${name}): ${duration}ms`, `The URL took ${duration}ms to respond, which exceeds the 1000ms threshold.`);
        }
    } catch (error) {
        await sendAlert(url, `Network Error (${name})`, `Failed to fetch URL. Error: ${error.message}`);
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

        for (const entry of urls) {
            await checkUrl(entry);
        }
    });
    console.log('Scheduler started: Checks every 5 minutes.');
};

module.exports = {
    addUrl,
    getUrls,
    startScheduler
};
