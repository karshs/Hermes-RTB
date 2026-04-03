require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('./db');

const runMigrations = async () => {
    const migrationsDir = path.join(__dirname, '../../migrations');
    const files = fs.readdirSync(migrationsDir).sort();

    console.log('Running migrations...');

    for (const file of files) {
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        try {
            await pool.query(sql);
            console.log(`✅ ${file}`);
        } catch (err) {
            console.error(`❌ ${file}: ${err.message}`);
            process.exit(1);
        }
    }

    console.log('All migrations complete!');
    process.exit(0);
};

runMigrations();