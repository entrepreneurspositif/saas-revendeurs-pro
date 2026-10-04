const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function fixSymlinks(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const lstat = fs.lstatSync(fullPath);

    if (lstat.isSymbolicLink()) {
      try {
        const realTarget = fs.realpathSync(fullPath);
        console.log(`Fixing symlink: ${fullPath} -> ${realTarget}`);
        fs.unlinkSync(fullPath);
        fs.cpSync(realTarget, fullPath, { recursive: true, dereference: true });
      } catch (err) {
        console.error(`Failed to dereference ${fullPath}:`, err.message);
      }
    } else if (lstat.isDirectory()) {
      fixSymlinks(fullPath);
    }
  }
}

async function deployDirect() {
  const root = process.cwd();
  const gitPath = path.join(root, '.git');
  const gitBakPath = path.join(root, '.git_bak');

  try {
    console.log('1. Building Next.js production output locally...');
    execSync('cmd /c "npx vercel build --prod"', { stdio: 'inherit' });

    console.log('2. Dereferencing Windows symlinks in .vercel/output...');
    const functionsDir = path.join(root, '.vercel', 'output', 'functions');
    if (fs.existsSync(functionsDir)) {
      fixSymlinks(functionsDir);
    }

    console.log('3. Temporarily hiding .git directory...');
    if (fs.existsSync(gitPath)) {
      if (fs.existsSync(gitBakPath)) {
        fs.rmSync(gitBakPath, { recursive: true, force: true });
      }
      fs.renameSync(gitPath, gitBakPath);
    }

    console.log('4. Deploying prebuilt bundle to Vercel Production...');
    execSync('cmd /c "npx vercel deploy --prebuilt --prod --yes"', { stdio: 'inherit' });

    console.log('Deploy process finished successfully!');
  } catch (err) {
    console.error('Error during direct deploy:', err.message);
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

deployDirect();
