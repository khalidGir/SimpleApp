const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Helper to create the table if it doesn't exist
const initDb = async () => {
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createMonitoredUrlsTable = `
    CREATE TABLE IF NOT EXISTS monitored_urls (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const alterMonitoredUrlsTable = `
    ALTER TABLE monitored_urls ADD COLUMN IF NOT EXISTS user_id INT REFERENCES users(id);
    ALTER TABLE monitored_urls ADD COLUMN IF NOT EXISTS last_status BOOLEAN DEFAULT TRUE;
    ALTER TABLE monitored_urls ADD COLUMN IF NOT EXISTS last_alert_sent_at TIMESTAMP;
    ALTER TABLE monitored_urls ADD COLUMN IF NOT EXISTS last_response_time_ms INTEGER;
    ALTER TABLE monitored_urls ADD COLUMN IF NOT EXISTS last_checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
  `;

  const alterUsersTable = `
    ALTER TABLE users ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS max_urls INTEGER DEFAULT 5;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS check_interval_seconds INTEGER DEFAULT 300;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS chapa_payment_id TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP;
  `;

  try {
    await pool.query(createUsersTable);
    await pool.query(alterUsersTable);
    await pool.query(createMonitoredUrlsTable);
    await pool.query(alterMonitoredUrlsTable);

    const createPingLogsTable = `
      CREATE TABLE IF NOT EXISTS ping_logs (
        id SERIAL PRIMARY KEY,
        url_id INT REFERENCES monitored_urls(id) ON DELETE CASCADE,
        status BOOLEAN NOT NULL,
        response_time_ms INTEGER,
        checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(createPingLogsTable);

    console.log('Database initialized: tables checked/created.');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
};

const createUser = async (email, passwordHash) => {
  const query = `
    INSERT INTO users (email, password_hash, plan, max_urls, check_interval_seconds) 
    VALUES ($1, $2, 'free', 5, 300) 
    RETURNING id, email, plan, max_urls, created_at
  `;
  const values = [email, passwordHash];
  const res = await pool.query(query, values);
  return res.rows[0];
};

const upgradeUserToPlan = async (userId, planType, paymentId) => {
  let maxUrls = 50;
  let interval = 60;
  
  if (planType === 'agency') {
    maxUrls = 500;
    interval = 30; // 30 second checks
  }

  const query = `
    UPDATE users 
    SET plan = $2, 
        max_urls = $3, 
        check_interval_seconds = $4,
        chapa_payment_id = $5
    WHERE id = $1
    RETURNING *
  `;
  const values = [userId, planType, maxUrls, interval, paymentId];
  const res = await pool.query(query, values);
  return res.rows[0];
};

const findUserByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE email = $1';
  const values = [email];
  const res = await pool.query(query, values);
  return res.rows[0];
};

const findUserById = async (id) => {
  const query = 'SELECT * FROM users WHERE id = $1';
  const values = [id];
  const res = await pool.query(query, values);
  return res.rows[0];
};

const getUserUrls = async (userId) => {
  const query = 'SELECT * FROM monitored_urls WHERE user_id = $1 ORDER BY created_at DESC';
  const values = [userId];
  const res = await pool.query(query, values);
  return res.rows;
};

const getPublicUserUrls = async (userId) => {
  const query = `
    SELECT name, url, last_status, last_response_time_ms, last_checked_at 
    FROM monitored_urls 
    WHERE user_id = $1 AND active = true 
    ORDER BY name ASC
  `;
  const values = [userId];
  const res = await pool.query(query, values);
  return res.rows;
};

const findUserByVerificationToken = async (token) => {
  const query = 'SELECT * FROM users WHERE verification_token = $1';
  const values = [token];
  const res = await pool.query(query, values);
  return res.rows[0];
};

const verifyUser = async (userId) => {
  const query = 'UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE id = $1';
  await pool.query(query, [userId]);
};

const setResetToken = async (email, token, expiry) => {
  const query = 'UPDATE users SET reset_token = $2, reset_token_expiry = $3 WHERE email = $1';
  await pool.query(query, [email, token, expiry]);
};

const findUserByResetToken = async (token) => {
  const query = 'SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()';
  const res = await pool.query(query, [token]);
  return res.rows[0];
};

const updatePassword = async (userId, hashedPassword) => {
  const query = 'UPDATE users SET password_hash = $2, reset_token = NULL, reset_token_expiry = NULL WHERE id = $1';
  await pool.query(query, [userId, hashedPassword]);
};

const savePingLog = async (urlId, status, responseTimeMs) => {
  const query = 'INSERT INTO ping_logs (url_id, status, response_time_ms) VALUES ($1, $2, $3)';
  await pool.query(query, [urlId, status, responseTimeMs]);
};

module.exports = { pool, initDb, createUser, findUserByEmail, getUserUrls, findUserById, upgradeUserToPlan, getPublicUserUrls, findUserByVerificationToken, verifyUser, savePingLog, setResetToken, findUserByResetToken, updatePassword };

