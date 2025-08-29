
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { Pool } = require('pg');
const fs = require('fs');

function must(name) {
  const v = process.env[name];
  if (v === undefined || v === null || v === '') {
    throw new Error(`Missing ${name} in server/.env`);
  }
  return v;
}

const pool = new Pool({
  host: must('PGHOST'),
  port: Number(process.env.PGPORT) || 5432,
  user: must('PGUSER'),
  password: String(must('PGPASSWORD')),
  database: must('PGDATABASE'),
});

async function setupDatabase() {
  try {
    console.log('DB config:', {
      host: pool.options.host,
      port: pool.options.port,
      user: pool.options.user,
      database: pool.options.database,
      hasPwd: !!process.env.PGPASSWORD,
    });

    console.log('Setting up database...');

    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(schema);
    console.log('✓ Schema created');

    const seed = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
    await pool.query(seed);
    console.log('✓ Seed data inserted');

    const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM exercises;');
    console.log(`✓ Database ready with ${rows[0].count} exercises`);
  } catch (err) {
    console.error('Database setup failed:', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

setupDatabase();
