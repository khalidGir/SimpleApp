const { pool } = require('./db');

const email = 'khalweleed@gmail.com';

console.log(`Attempting to manually verify ${email}...`);

const run = async () => {
    try {
        const res = await pool.query("UPDATE users SET is_verified = TRUE WHERE email = $1 RETURNING *", [email]);
        if (res.rows.length > 0) {
            console.log(`SUCCESS: Account ${email} is now VERIFIED!`);
        } else {
            console.log(`ERROR: User ${email} not found.`);
        }
        process.exit(0);
    } catch (e) {
        console.error('Database Error:', e);
        process.exit(1);
    }
};

run();
