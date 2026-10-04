const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function deployNoGit() {
  const root = process.cwd();
  const gitPath = path.join(root, '.git');
  const gitBakPath = path.join(root, '.git_bak');

  try {
    console.log('1. Hiding .git folder to perform unlinked CLI deployment...');
    if (fs.existsSync(gitPath)) {
      if (fs.existsSync(gitBakPath)) {
        fs.rmSync(gitBakPath, { recursive: true, force: true });
      }
      fs.renameSync(gitPath, gitBakPath);
    }

    console.log('2. Deploying source directly to Vercel production...');
    execSync('cmd /c "npx vercel --prod --yes"', { stdio: 'inherit' });

    console.log('Deployment completed successfully!');
  } catch (err) {
    console.error('Deployment failed:', err.message);
  } finally {
    if (fs.existsSync(gitBakPath)) {
      console.log('3. Restoring .git directory...');
      if (fs.existsSync(gitPath)) {
        fs.rmSync(gitPath, { recursive: true, force: true });
      }
      fs.renameSync(gitBakPath, gitPath);
    }
  }
}

deployNoGit();
