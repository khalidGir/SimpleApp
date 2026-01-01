const cron = require('node-cron');
const { sendAlert } = require('./alerts');
const { pool } = require('./db');

const addUrl = async (url, name = 'Manual Check', userId = null) => {
    // 1. Immediate Verification
    const start = Date.now();
    let success = false;
    let status = 0;
    try {
        const res = await fetch(url);
        status = res.status;
        success = res.ok; // Status 200-299
    } catch (e) {
        status = 500;
        success = false;
    }
    const duration = Date.now() - start;
    
    // 2. Insert with initial state
    try {
        const query = `
            INSERT INTO monitored_urls 
            (name, url, user_id, last_status, last_response_time_ms) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING *
        `;
        const values = [name, url, userId, success, duration];
        const res = await pool.query(query, values);
        console.log(`Verified & Added ${url} (Status: ${status}, Time: ${duration}ms)`);
        
        // Return full object so frontend sees verification result
        return { ...res.rows[0], initialCheck: { success, status, duration } };
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
    const { id, url, name, last_status } = entry;
    const start = Date.now();
    let success = false;
    let status = 0;
    let errorMessage = '';

    // 1. Check current health
    try {
        const response = await fetch(url);
        status = response.status;
        success = response.ok; // True if status is 200-299
        if (!success) errorMessage = `Status: ${status}`;
    } catch (error) {
        status = 500;
        success = false;
        errorMessage = error.message;
    }
    const duration = Date.now() - start;

    // 2. Alert Logic (State Change Only)
    // Send alert ONLY if it was UP (true) and is now DOWN (false)
    let alertSent = false;
    if (!success && last_status === true) {
        console.log(`[STATE CHANGE] ${name} went DOWN. Sending alert.`);
        await sendAlert(
            url, 
            `ALERT: ${name} is DOWN`, 
            `URL: ${url}\nStatus: ${status}\nError: ${errorMessage}\nTime: ${new Date().toISOString()}`
        );
        alertSent = true;
    } else if (success && last_status === false) {
        console.log(`[STATE CHANGE] ${name} Recovered (UP).`);
        // Optional: Send recovery email here
    } else {
        // No state change (Stable UP or Stable DOWN)
        // console.log(`[CHECK] ${name}: ${success ? 'OK' : 'DOWN (Already alerted)'}`);
    }

    // 3. Update Database
    try {
        const updateQuery = `
            UPDATE monitored_urls 
            SET last_status = $1, 
                last_response_time_ms = $2,
                last_alert_sent_at = CASE WHEN $3 THEN NOW() ELSE last_alert_sent_at END
            WHERE id = $4
        `;
        await pool.query(updateQuery, [success, duration, alertSent, id]);
    } catch (err) {
        console.error(`Failed to update stats for ${url}:`, err);
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
