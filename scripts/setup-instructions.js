console.log('🎯 PromptVault Database Setup Instructions');
console.log('==========================================');
console.log('');
console.log('✅ RECOMMENDED: Use Supabase Dashboard (Easiest Method)');
console.log('');
console.log('1. 🌐 Go to: https://supabase.com/dashboard');
console.log('2. 🔑 Sign in and open your project');
console.log('3. 📝 Navigate to: SQL Editor (in the left sidebar)');
console.log('4. 📋 Copy ALL the SQL from: New plan/promptvault_expanded_schema.sql');
console.log('5. 📝 Paste it into the SQL Editor');
console.log('6. ▶️  Click "Run" to execute the schema');
console.log('');
console.log('🎉 That\'s it! Your database will be ready with all tables.');
console.log('');
console.log('💡 The SQL file contains:');
console.log('   • All table structures');
console.log('   • Indexes for performance');
console.log('   • Sample data to get started');
console.log('   • Security policies (RLS)');
console.log('');
console.log('🔗 Your Supabase project: ' + (process.env.NEXT_PUBLIC_SUPABASE_URL || 'Check .env.local'));

const fs = require('fs');
const path = require('path');

try {
  const schemaPath = path.join(__dirname, '..', 'New plan', 'promptvault_expanded_schema.sql');
  const stats = fs.statSync(schemaPath);
  console.log(`📄 Schema file size: ${Math.round(stats.size / 1024)}KB`);
} catch (error) {
  console.log('📄 Schema file: New plan/promptvault_expanded_schema.sql');
}