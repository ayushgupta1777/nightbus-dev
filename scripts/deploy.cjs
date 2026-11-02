// ==================== bus/web/scripts/deploy.cjs ====================
// Deploys static build directly to gh-pages branch without using GitHub Actions minutes

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const webRoot = path.resolve(__dirname, '..');
const distDir = path.join(webRoot, 'dist');

console.log('📦 1. Building production bundle with Vite...');
execSync('npm run build', { stdio: 'inherit', cwd: webRoot });

console.log('📄 2. Preparing 404.html routing fallback and .nojekyll...');
fs.copyFileSync(path.join(distDir, 'index.html'), path.join(distDir, '404.html'));
fs.writeFileSync(path.join(distDir, '.nojekyll'), '');

console.log('🚀 3. Pushing static files directly to gh-pages branch (ZERO GitHub Actions quota consumed)...');
execSync('npx gh-pages -d dist --dotfiles -m "deploy: update staging"', { stdio: 'inherit', cwd: webRoot });

console.log('🎉 Staging updated live: https://ayushgupta1777.github.io/nightbus-dev/');
