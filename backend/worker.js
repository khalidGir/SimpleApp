const { initDb } = require('./db');
const { startScheduler, startCleanupJob } = require('./schedule');

console.log('Starting SimpleApp Worker Node...');

// Initialize Database Connection
initDb().then(() => {
    console.log('Worker connected to Database.');
    
    // Start the Monitoring Scheduler
    startScheduler();

    // Start Maintenance Job
    startCleanupJob();
    
    console.log('Worker is now running. Press Ctrl+C to stop.');}).catch(err => {
    console.error('Failed to start worker:', err);
    process.exit(1);
});
