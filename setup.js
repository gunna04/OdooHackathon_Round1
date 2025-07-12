#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up SkillSwap Hub for local development...\n');

// Check if .env exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    console.log('📝 Creating .env file from template...');
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created. Please edit it with your database credentials.\n');
  } else {
    console.log('❌ env.example not found. Please create a .env file manually.');
    process.exit(1);
  }
} else {
  console.log('✅ .env file already exists.\n');
}

// Check if PostgreSQL is running
console.log('🔍 Checking PostgreSQL connection...');
try {
  execSync('pg_isready -h localhost -p 5432', { stdio: 'pipe' });
  console.log('✅ PostgreSQL is running.\n');
} catch (error) {
  console.log('❌ PostgreSQL is not running or not accessible.');
  console.log('Please make sure PostgreSQL is installed and running on localhost:5432\n');
  process.exit(1);
}

// Install dependencies
console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed.\n');
} catch (error) {
  console.log('❌ Failed to install dependencies.');
  process.exit(1);
}

// Set up database
console.log('🗄️  Setting up database...');
try {
  execSync('npm run db:setup', { stdio: 'inherit' });
  console.log('✅ Database setup completed.\n');
} catch (error) {
  console.log('❌ Database setup failed. Please check your database credentials in .env');
  process.exit(1);
}

console.log('🎉 Setup completed successfully!');
console.log('\nNext steps:');
console.log('1. Edit .env file with your database credentials if needed');
console.log('2. Run "npm run dev" to start the development server');
console.log('3. Open http://localhost:5000 in your browser');
console.log('\nHappy coding! 🚀'); 