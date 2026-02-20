// Script to generate bcrypt hash for password
// Run with: node scripts/generate-hash.js

const bcrypt = require('bcryptjs');

const password = 'admin123';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, function(err, hash) {
  if (err) {
    console.error('Error generating hash:', err);
    return;
  }
  
  console.log('=================================');
  console.log('Password:', password);
  console.log('Bcrypt Hash:', hash);
  console.log('=================================');
  console.log('\nCopy this hash to your .env.local file:');
  console.log(`ADMIN_PASSWORD_HASH=${hash}`);
  
  // Verify the hash works
  bcrypt.compare(password, hash, function(err, result) {
    if (err) {
      console.error('Error verifying hash:', err);
      return;
    }
    console.log('\nVerification:', result ? 'SUCCESS ✓' : 'FAILED ✗');
  });
});