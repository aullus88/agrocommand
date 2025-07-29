// Script to create debt management tables in Supabase
// Run this with: node scripts/setup-debt-tables.js

const fs = require('fs')
const path = require('path')

const migrationPath = path.join(__dirname, '../supabase/migrations/20250128_debt_payments.sql')
const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

console.log('📋 Debt Management Database Migration')
console.log('=====================================')
console.log('')
console.log('To set up the debt management tables in Supabase, run the following SQL:')
console.log('')
console.log('```sql')
console.log(migrationSQL)
console.log('```')
console.log('')
console.log('Or use the Supabase CLI:')
console.log('supabase db push')
console.log('')
console.log('Then you can:')
console.log('1. Navigate to /financial/debt-management/admin')
console.log('2. Import your CSV data using the import tool')  
console.log('3. Switch between real and mock data on the main page')
console.log('')