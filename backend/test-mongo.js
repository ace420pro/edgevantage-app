const mongoose = require('mongoose');

// Replace this with your actual MongoDB URI
const MONGODB_URI = 'mongodb+srv://edgevantage_admin:YOUR_PASSWORD_HERE@cluster0.iih1qmp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

console.log('Testing MongoDB connection...');
console.log('URI format check:', MONGODB_URI.includes('YOUR_PASSWORD_HERE') ? '❌ REPLACE YOUR_PASSWORD_HERE WITH YOUR ACTUAL PASSWORD!' : '✅ Password replaced');

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected successfully!');
  console.log('Connection state:', mongoose.connection.readyState);
  console.log('Database name:', mongoose.connection.name);
  console.log('\n🎉 Your MongoDB connection is working! Use this exact URI in Vercel.');
  process.exit(0);
})
.catch((err) => {
  console.error('❌ MongoDB connection failed:');
  console.error('Error:', err.message);
  
  if (err.message.includes('authentication failed')) {
    console.error('\n⚠️  Check your password is correct');
  } else if (err.message.includes('ENOTFOUND')) {
    console.error('\n⚠️  Check your cluster name is correct');
  } else if (err.message.includes('Network')) {
    console.error('\n⚠️  Check MongoDB Atlas Network Access allows 0.0.0.0/0');
  }
  
  process.exit(1);
});

// Timeout after 15 seconds
setTimeout(() => {
  console.error('\n❌ Connection timed out after 15 seconds');
  console.error('Possible issues:');
  console.error('1. MongoDB Atlas cluster might be paused');
  console.error('2. Network Access not configured (add 0.0.0.0/0)');
  console.error('3. Wrong cluster URL');
  process.exit(1);
}, 15000);