const { execSync } = require('child_process');

try {
  console.log('Rebasing last 20 commits to change author to entrepreneurspositif-1123...');
  const cmd = `git rebase HEAD~20 --exec "git commit --amend --author=\\"entrepreneurspositif-1123 <entrepreneurspositif1123@gmail.com>\\" --no-edit"`;
  execSync(cmd, { stdio: 'inherit' });
  console.log('Successfully updated git commit authors!');
} catch (err) {
  console.error('Error rewriting git history:', err.message);
}
