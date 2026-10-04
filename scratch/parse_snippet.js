const fs = require('fs');

const text = fs.readFileSync('d:\\Digital produit\\Web\\scratch\\docs_snippet.txt', 'utf8');

// Find all matches for endpoints or curl commands or JSON payloads
const curls = text.match(/curl[^\`"']+/g) || [];
console.log('CURL COMMANDS FOUND:');
curls.forEach(c => console.log('---', c.replace(/\\n/g, '\n')));

const endpoints = text.match(/\/api\/[a-zA-Z0-9_\-\/]+/g) || [];
console.log('\nENDPOINTS FOUND:', [...new Set(endpoints)]);
