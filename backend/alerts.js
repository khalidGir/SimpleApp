const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', // You can change this to another provider or use SMTP settings
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/**
 * Sends an alert email.
 * @param {string} url - The URL that failed or was slow.
 * @param {string} subject - The subject of the alert.
 * @param {string} message - The details of the alert.
 */
const sendAlert = async (url, subject, message) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('Email credentials not set. Skipping email alert.');
        console.log(`[ALERT Would Be Sent] To: ${process.env.EMAIL_USER || 'Admin'}, Subject: ${subject}, Body: ${message}`);
        return;
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // Sending to self for now
        subject: `[Monitor Alert] ${subject} - ${url}`,
        text: `Alert for URL: ${url}\n\n${message}\n\nTimestamp: ${new Date().toISOString()}`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Alert email sent for ${url}`);
    } catch (error) {
        console.error('Error sending alert email:', error);
    }
};

module.exports = { sendAlert };
