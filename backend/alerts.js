const { Resend } = require('resend');

// Safely initialize Resend (prevent crash if key is missing)
const resend = process.env.RESEND_API_KEY 
    ? new Resend(process.env.RESEND_API_KEY) 
    : null;

/**
 * Sends an alert email using Resend.
 * @param {string} url - The URL that failed or was slow.
 * @param {string} subject - The subject of the alert.
 * @param {string} message - The details of the alert.
 */
const sendAlert = async (url, subject, message) => {
    if (!resend || !process.env.ALERT_EMAIL) {
        console.warn('[System] Email alerts disabled (Missing Key or Email).');
        console.log(`[ALERT LOG] Subject: ${subject}`);
        return;
    }

    try {
        await resend.emails.send({
            from: 'SimpleApp <onboarding@resend.dev>',
            to: process.env.ALERT_EMAIL,
            subject: `[Monitor Alert] ${subject} - ${url}`,
            text: `Alert for URL: ${url}\n\n${message}\n\nTimestamp: ${new Date().toISOString()}`,
        });
        console.log(`Alert email sent for ${url} via Resend`);
    } catch (error) {
        console.error('Error sending alert email via Resend:', error);
    }
};

module.exports = { sendAlert };