const { execSync } = require('child_process');

try {
  console.log('Amending commit with clean author...');
  execSync('git commit --amend --author="entrepreneurspositif-1123 <entrepreneurspositif1123@gmail.com>" --no-edit', { stdio: 'inherit' });

  console.log('Pushing to GitHub main branch...');
  execSync('git push origin main -f', { stdio: 'inherit' });

  console.log('Git push completed successfully!');
} catch (err) {
  console.error('Git push failed:', err.message);
}
