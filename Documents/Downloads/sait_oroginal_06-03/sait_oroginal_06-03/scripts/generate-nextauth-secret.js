/**
 * Generate a secure NEXTAUTH_SECRET
 * 
 * Run with: node scripts/generate-nextauth-secret.js
 * Then copy the output to your .env and Vercel environment variables
 */

const crypto = require('crypto');

const secret = crypto.randomBytes(32).toString('hex');

console.log('\n=== NEXTAUTH_SECRET Generation ===\n');
console.log('Generated secure secret:');
console.log(secret);
console.log('\nAdd this to your .env file:');
console.log(`NEXTAUTH_SECRET="${secret}"`);
console.log('\nOr set it in Vercel:');
console.log('vercel env add NEXTAUTH_SECRET');
console.log('(Then paste the above secret)\n');
