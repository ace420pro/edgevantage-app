const bcrypt = require('bcryptjs');

const password = 'EdgeVantage2024!Secure';
const saltRounds = 12;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error generating hash:', err);
    process.exit(1);
  }

  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('\nUse this in your SQL migration:');
  console.log(`'${hash}'`);
});