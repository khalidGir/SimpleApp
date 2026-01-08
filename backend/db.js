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
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='monitored_urls' AND column_name='user_id') THEN
            ALTER TABLE monitored_urls ADD COLUMN user_id INT REFERENCES users(id);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='monitored_urls' AND column_name='last_status') THEN
            ALTER TABLE monitored_urls ADD COLUMN last_status BOOLEAN DEFAULT TRUE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='monitored_urls' AND column_name='last_alert_sent_at') THEN
            ALTER TABLE monitored_urls ADD COLUMN last_alert_sent_at TIMESTAMP;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='monitored_urls' AND column_name='last_response_time_ms') THEN
            ALTER TABLE monitored_urls ADD COLUMN last_response_time_ms INTEGER;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='monitored_urls' AND column_name='last_checked_at') THEN
            ALTER TABLE monitored_urls ADD COLUMN last_checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        END IF;
    END
    $$;
  `;

  const alterUsersTable = `
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='plan') THEN
            ALTER TABLE users ADD COLUMN plan TEXT DEFAULT 'free';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='max_urls') THEN
            ALTER TABLE users ADD COLUMN max_urls INTEGER DEFAULT 5;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='check_interval_seconds') THEN
            ALTER TABLE users ADD COLUMN check_interval_seconds INTEGER DEFAULT 300;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='chapa_payment_id') THEN
            ALTER TABLE users ADD COLUMN chapa_payment_id TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='is_verified') THEN
            ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='verification_token') THEN
            ALTER TABLE users ADD COLUMN verification_token TEXT;
        END IF;
    END
    $$;
  `;

  try {
    await pool.query(createUsersTable);
    await pool.query(alterUsersTable);
    await pool.query(createMonitoredUrlsTable);
    await pool.query(alterMonitoredUrlsTable);
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

const upgradeUserToPro = async (userId, paymentId) => {
  const query = `
    UPDATE users 
    SET plan = 'pro', 
        max_urls = 50, 
        check_interval_seconds = 60,
        chapa_payment_id = $2
    WHERE id = $1
    RETURNING *
  `;
  const values = [userId, paymentId];
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

module.exports = { pool, initDb, createUser, findUserByEmail, getUserUrls, findUserById, upgradeUserToPro, getPublicUserUrls, findUserByVerificationToken, verifyUser };

