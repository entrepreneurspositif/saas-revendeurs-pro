const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function deployMoneroo() {
  const root = process.cwd();
  const gitPath = path.join(root, '.git');
  const gitBakPath = path.join(root, '.git_bak');

  try {
    console.log('1. Staging and committing Moneroo integration files...');
    execSync('git add .', { stdio: 'inherit' });
    try {
      execSync('git commit -m "Integrate Moneroo payment gateway (Mobile Money & CB)" --author="entrepreneurspositif-1123 <entrepreneurspositif1123@gmail.com>"', { stdio: 'inherit' });
    } catch (e) {
      console.log('No new changes to commit or already committed.');
    }

    console.log('2. Pushing to GitHub main branch...');
    execSync('git push origin main', { stdio: 'inherit' });

    console.log('3. Hiding .git folder to perform unlinked CLI Vercel production deploy...');
    if (fs.existsSync(gitPath)) {
      if (fs.existsSync(gitBakPath)) {
        fs.rmSync(gitBakPath, { recursive: true, force: true });
      }
      fs.renameSync(gitPath, gitBakPath);
    }

    console.log('4. Deploying Moneroo integration directly to Vercel Production...');
    execSync('cmd /c "npx vercel --prod --yes"', { stdio: 'inherit' });

    console.log('Moneroo deployment completed successfully!');
  } catch (err) {
    console.error('Moneroo deployment failed:', err.message);
  } finally {
    if (fs.existsSync(gitBakPath)) {
      console.log('5. Restoring .git directory...');
      if (fs.existsSync(gitPath)) {
        fs.rmSync(gitPath, { recursive: true, force: true });
      }
      fs.renameSync(gitBakPath, gitPath);
    }
  }
}

deployMoneroo();
