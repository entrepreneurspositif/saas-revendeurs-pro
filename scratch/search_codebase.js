const fs = require('fs');
const path = require('path');

function searchDir(dir, pattern) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules' && file !== '.next') {
        searchDir(fullPath, pattern);
      }
    } else {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes(pattern)) {
          console.log('FOUND IN FILE:', fullPath);
        }
      } catch(e) {}
    }
  }
}

console.log('Searching for "Identifiant custom_id manquant"...');
searchDir('d:\\Digital produit\\Web\\src', 'Identifiant custom_id manquant');
console.log('Search finished.');
