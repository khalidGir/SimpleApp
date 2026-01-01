const cron = require('node-cron');
const { sendAlert } = require('./alerts');
const { pool } = require('./db');

const addUrl = async (url, name = 'Manual Check', userId = null) => {
    // 0. Check Limits (Guardrails)
    if (userId) {
        const userRes = await pool.query('SELECT max_urls FROM users WHERE id = $1', [userId]);
        const countRes = await pool.query('SELECT COUNT(*) FROM monitored_urls WHERE user_id = $1', [userId]);
        
        const maxUrls = userRes.rows[0]?.max_urls || 5; // Default to 5 if not found
        const currentCount = parseInt(countRes.rows[0]?.count || 0, 10);

        if (currentCount >= maxUrls) {
            throw new Error(`Limit reached: You can only monitor ${maxUrls} URLs on your current plan.`);
        }
    }

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
            (name, url, user_id, last_status, last_response_time_ms, last_checked_at) 
            VALUES ($1, $2, $3, $4, $5, NOW()) 
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

const getDueUrls = async () => {
    try {
        // Fetch URLs joined with users to check interval
        // Default interval 300s (5m) if user or setting missing
        const query = `
            SELECT m.*, u.check_interval_seconds 
            FROM monitored_urls m
            LEFT JOIN users u ON m.user_id = u.id
            WHERE m.active = true 
            AND (
                m.last_checked_at IS NULL 
                OR m.last_checked_at < NOW() - (COALESCE(u.check_interval_seconds, 300) * INTERVAL '1 second')
            )
        `;
        const res = await pool.query(query);
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
    }

    // 3. Update Database
    try {
        const updateQuery = `
            UPDATE monitored_urls 
            SET last_status = $1, 
                last_response_time_ms = $2,
                last_checked_at = NOW(),
                last_alert_sent_at = CASE WHEN $3 THEN NOW() ELSE last_alert_sent_at END
            WHERE id = $4
        `;
        await pool.query(updateQuery, [success, duration, alertSent, id]);
    } catch (err) {
        console.error(`Failed to update stats for ${url}:`, err);
    }
};

const startScheduler = () => {
    // Schedule task to run every MINUTE
    cron.schedule('* * * * *', async () => {
        // console.log('Checking for due URLs...');
        const urls = await getDueUrls();
        if (urls.length === 0) {
            return;
        }
        console.log(`Found ${urls.length} URLs due for check.`);

        for (const entry of urls) {
            await checkUrl(entry);
        }
    });
    console.log('Scheduler started: Running every minute to check due URLs.');
};

module.exports = {
    addUrl,
    startScheduler
};
