require('dotenv').config();
const path = require('path');
const fs = require('fs');
const knexLib = require('knex');

const client = process.env.DB_CLIENT || 'sqlite3';

let config;

if (client === 'pg') {
  // ---- PRODUCTION / PAID TIER ----
  // Works with Supabase, Neon, Render Postgres, RDS, etc.
  config = {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    pool: { min: 0, max: 10 },
  };
} else {
  // ---- FREE TIER / LOCAL TESTING ----
  const dbFile = process.env.DB_FILE || './data/pathlab.sqlite3';
  const dir = path.dirname(dbFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  config = {
    client: 'sqlite3',
    connection: { filename: dbFile },
    useNullAsDefault: true,
  };
}

const knex = knexLib(config);

module.exports = knex;
