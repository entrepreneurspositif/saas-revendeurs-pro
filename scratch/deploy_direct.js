const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const gitPath = path.join(process.cwd(), '.git');
const gitBakPath = path.join(process.cwd(), '.git_bak');

async function main() {
  console.log("Preparing direct Vercel deployment...");

  if (fs.existsSync(gitPath)) {
    console.log("Temporarily bypassing Git metadata...");
    fs.renameSync(gitPath, gitBakPath);
  }

  try {
    console.log("Deploying directly to Vercel production as entrepreneurspositif-1123...");
    const output = execSync("npx vercel --prod --yes", {
      encoding: 'utf-8',
      stdio: 'inherit'
    });
    console.log("Direct deployment output:", output);
  } finally {
    if (fs.existsSync(gitBakPath)) {
      console.log("Restoring Git metadata...");
      fs.renameSync(gitBakPath, gitPath);
    }
  }
}

main().catch(err => {
  console.error("Direct deploy error:", err.message);
  process.exit(1);
});
