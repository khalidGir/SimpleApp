const { Resend } = require('resend');

const resend = process.env.RESEND_API_KEY 
    ? new Resend(process.env.RESEND_API_KEY) 
    : null;

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const API_URL = process.env.API_URL || 'http://localhost:5000';

const sendVerificationEmail = async (email, token) => {
    // In production, this link should point to the backend verify endpoint
    // which then redirects to frontend.
    const verifyLink = `${API_URL}/verify-email?token=${token}`;

    // Always log the link in development so we don't get locked out
    console.log(`[VERIFY LINK]: ${verifyLink}`);

    if (!resend) {
        console.log(`[DEV] Verification Email to ${email}: ${verifyLink}`);
        return;
    }

    try {
        await resend.emails.send({
            from: 'SimpleApp <onboarding@resend.dev>',
            to: email,
            subject: 'Verify your SimpleApp Account',
            html: `
                <h2>Welcome to SimpleApp!</h2>
                <p>Please click the link below to verify your account:</p>
                <a href="${verifyLink}" style="padding: 10px 20px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
                <p>Or copy this link: ${verifyLink}</p>
            `
        });
        console.log(`Verification email sent to ${email}`);
    } catch (error) {
        console.error('Failed to send verification email:', error);
    }
};

module.exports = { sendVerificationEmail };
