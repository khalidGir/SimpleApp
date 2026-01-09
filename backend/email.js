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

const sendResetPasswordEmail = async (email, token) => {
    const resetLink = `${FRONTEND_URL}/reset-password?token=${token}`;

    // Always log the link in development
    console.log(`[RESET LINK]: ${resetLink}`);

    if (!resend) {
        console.log(`[DEV] Reset Email to ${email}: ${resetLink}`);
        return;
    }

    try {
        await resend.emails.send({
            from: 'SimpleApp <onboarding@resend.dev>',
            to: email,
            subject: 'Reset your SimpleApp Password',
            html: `
                <h2>Password Reset Request</h2>
                <p>You requested a password reset. Click the link below to set a new password:</p>
                <a href="${resetLink}" style="padding: 10px 20px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
                <p>If you did not request this, please ignore this email.</p>
                <p>Link: ${resetLink}</p>
            `
        });
        console.log(`Reset email sent to ${email}`);
    } catch (error) {
        console.error('Failed to send reset email:', error);
    }
};

module.exports = { sendVerificationEmail, sendResetPasswordEmail };
