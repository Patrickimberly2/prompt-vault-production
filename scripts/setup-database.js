const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '../.env.local' });

async function setupDatabase() {
  // Extract connection details from Supabase URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
  }

  // Parse Supabase URL to get connection details
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  
  if (!projectRef) {
    console.error('❌ Invalid Supabase URL format');
    process.exit(1);
  }

  // Create PostgreSQL connection
  const client = new Client({
    host: `db.${projectRef}.supabase.co`,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: process.env.SUPABASE_DB_PASSWORD || prompt('Enter your Supabase database password: '),
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully!');

    // Read the SQL schema file
    const schemaPath = path.join(__dirname, '..', 'New plan', 'promptvault_expanded_schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('📋 Executing database schema...');
    
    // Execute the SQL
    await client.query(schemaSql);
    
    console.log('✅ Database schema created successfully!');
    console.log('🎉 Your PromptVault database is ready!');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    
    if (error.message.includes('password authentication failed')) {
      console.log('\n💡 Tip: You need your Supabase database password.');
      console.log('   Find it in: Supabase Dashboard → Settings → Database → Connection string');
    }
  } finally {
    await client.end();
  }
}

// Alternative: Use Supabase REST API approach
async function setupWithSupabaseAPI() {
  console.log('🔄 Alternative: Using Supabase Management API...');
  console.log('📝 Please run the SQL manually in your Supabase SQL Editor:');
  console.log('   1. Go to https://supabase.com/dashboard');
  console.log('   2. Open your project');
  console.log('   3. Go to SQL Editor');
  console.log('   4. Copy and paste the SQL from: New plan/promptvault_expanded_schema.sql');
  console.log('   5. Click "Run"');
}

// Run setup
if (process.argv.includes('--api-only')) {
  setupWithSupabaseAPI();
} else {
  setupDatabase().catch(console.error);
}