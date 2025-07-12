import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const envPath = path.resolve(__dirname, '../.env');
console.log('Reading .env from:', envPath);
console.log('Raw .env contents:\n', fs.readFileSync(envPath, 'utf-8'));

// Database configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: 'postgres', // Connect to default database first
});

async function setupDatabase() {
  const client = await pool.connect();
  
  try {
    const dbName = process.env.DB_NAME || 'skillswaphub';
    
    // Check if database exists
    const dbExists = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );
    
    if (dbExists.rows.length === 0) {
      console.log(`Creating database: ${dbName}`);
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Database ${dbName} created successfully`);
    } else {
      console.log(`✅ Database ${dbName} already exists`);
    }
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function runMigrations() {
  const dbPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'skillswaphub',
  });
  
  const client = await dbPool.connect();
  
  try {
    // Create tables based on schema
    const createTablesSQL = `
      -- Sessions table
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR PRIMARY KEY,
        sess JSONB NOT NULL,
        expire TIMESTAMP NOT NULL
      );
      CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);
      
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY NOT NULL,
        email VARCHAR UNIQUE,
        password VARCHAR,
        first_name VARCHAR,
        last_name VARCHAR,
        profile_image_url VARCHAR,
        bio TEXT,
        location VARCHAR,
        is_public BOOLEAN DEFAULT TRUE,
        is_admin BOOLEAN DEFAULT FALSE,
        auth_provider VARCHAR DEFAULT 'local',
        last_active_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      -- Skills table
      CREATE TABLE IF NOT EXISTS skills (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR NOT NULL,
        level VARCHAR NOT NULL,
        type VARCHAR NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      -- Availability table
      CREATE TABLE IF NOT EXISTS availability (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        day_of_week INTEGER NOT NULL,
        start_time VARCHAR NOT NULL,
        end_time VARCHAR NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      -- Swap requests table
      CREATE TABLE IF NOT EXISTS swap_requests (
        id SERIAL PRIMARY KEY,
        requester_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        receiver_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        offered_skill_id INTEGER REFERENCES skills(id),
        requested_skill_id INTEGER REFERENCES skills(id),
        message TEXT,
        status VARCHAR NOT NULL DEFAULT 'pending',
        proposed_time TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      -- Reviews table
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        swap_request_id INTEGER NOT NULL REFERENCES swap_requests(id) ON DELETE CASCADE,
        reviewer_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        reviewee_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL,
        comment TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      -- Reports table
      CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY,
        reporter_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        reported_user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
        content_type VARCHAR NOT NULL,
        content_id VARCHAR,
        reason VARCHAR NOT NULL,
        description TEXT,
        status VARCHAR NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;
    
    await client.query(createTablesSQL);
    console.log('✅ Database tables created successfully');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await dbPool.end();
  }
}

async function main() {
  try {
    console.log('🚀 Setting up database...');
    console.log('Environment variables:');
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_PORT:', process.env.DB_PORT);
    console.log('DB_USER:', process.env.DB_USER);
    console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'NOT SET');
    console.log('DB_NAME:', process.env.DB_NAME);
    await setupDatabase();
    await runMigrations();
    console.log('✅ Database setup completed successfully!');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// ES module equivalent of require.main === module
main(); 