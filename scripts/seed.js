const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

async function seed() {
  console.log('🌱 Initializing P2P Student Micro-Lending Network Database...');

  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl && !dbUrl.includes('postgres:postgres@localhost')) {
    console.log('Connecting to PostgreSQL / Supabase instance...');
    try {
      const isSsl = dbUrl.includes('supabase') || dbUrl.includes('pooler') || dbUrl.includes('sslmode=require');
      const pool = new Pool({
        connectionString: dbUrl,
        ssl: isSsl ? { rejectUnauthorized: false } : false,
      });

      const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
      const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');

      console.log('Applying schema.sql...');
      await pool.query(schemaSql);
      console.log('Applying seed.sql...');
      await pool.query(seedSql);

      console.log('✅ Supabase / PostgreSQL database successfully initialized and seeded!');
      await pool.end();
      return;
    } catch (err) {
      console.warn('⚠️ Could not connect to PostgreSQL server:', err.message);
      console.log('Initializing local fallback storage for offline testing...');
    }
  }

  // Local fallback reset
  const fallbackPath = path.join(process.cwd(), '.db_fallback.json');
  if (fs.existsSync(fallbackPath)) {
    fs.unlinkSync(fallbackPath);
  }
  console.log('✅ Local storage initialized with default demo students and requests!');
}

seed();
