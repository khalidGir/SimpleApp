const cron = require('node-cron');
const { sendAlert } = require('./alerts');
const { pool } = require('./db');

const addUrl = async (url, name = 'Manual Check', userId = null) => {
    try {
        const query = 'INSERT INTO monitored_urls (name, url, user_id) VALUES ($1, $2, $3) RETURNING *';
        const values = [name, url, userId];
        const res = await pool.query(query, values);
        console.log(`Added ${url} to monitoring list (DB).`);
        return res.rows[0];
    } catch (err) {
        console.error('Error adding URL to DB:', err);
        throw err;
    }
};

const getUrls = async () => {
    try {
        const res = await pool.query('SELECT * FROM monitored_urls WHERE active = true');
        return res.rows;
    } catch (err) {
        console.error('Error fetching URLs from DB:', err);
        return [];
    }
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
        const urls = await getUrls();
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
