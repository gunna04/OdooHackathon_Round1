import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'skillswaphub',
});

async function makeAdmin(email) {
  try {
    const client = await pool.connect();
    
    // Check if user exists
    const userCheck = await client.query(
      'SELECT id, email, first_name, last_name, is_admin FROM users WHERE email = $1',
      [email]
    );
    
    if (userCheck.rows.length === 0) {
      console.log(`❌ User with email "${email}" not found`);
      return;
    }
    
    const user = userCheck.rows[0];
    console.log(`Found user: ${user.first_name} ${user.last_name} (${user.email})`);
    console.log(`Current admin status: ${user.is_admin}`);
    
    if (user.is_admin) {
      console.log('✅ User is already an admin');
      return;
    }
    
    // Make user admin
    await client.query(
      'UPDATE users SET is_admin = true WHERE email = $1',
      [email]
    );
    
    console.log('✅ User is now an admin!');
    console.log('You can now access the admin page at /admin');
    
    client.release();
  } catch (error) {
    console.error('❌ Error making user admin:', error);
  } finally {
    await pool.end();
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log('Usage: node scripts/make-admin.js <email>');
  console.log('Example: node scripts/make-admin.js user@example.com');
  process.exit(1);
}

makeAdmin(email); 