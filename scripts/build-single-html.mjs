import {execSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, 'dist-single');

console.log('Building MyFirst Account standalone single HTML...');

execSync('npx vite build', {
  cwd: rootDir,
  stdio: 'inherit',
  env: {
    ...process.env,
    SINGLE_FILE: 'true',
  },
});

const builtHtmlPath = path.join(outDir, 'index.html');
const targetHtmlPath = path.join(outDir, 'MyFirstAccount.html');

if (!fs.existsSync(builtHtmlPath)) {
  throw new Error('Expected dist-single/index.html was not generated.');
}

let html = fs.readFileSync(builtHtmlPath, 'utf8');

// Inline SVG favicon if available so MyFirstAccount.html is 100% self-contained
const svgIconPath = path.join(rootDir, 'public', 'icon.svg');
if (fs.existsSync(svgIconPath)) {
  const svgBase64 = fs.readFileSync(svgIconPath).toString('base64');
  html = html.replace(
    /<link\s+rel="icon"[^>]*href="[^"]*icon\.svg"[^>]*>/i,
    `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,${svgBase64}" />`
  );
}

// Strip external icon/manifest references that cannot resolve over file://
html = html.replace(/<link\s+rel="apple-touch-icon"[^>]*>\s*/gi, '');
html = html.replace(/<link\s+rel="manifest"[^>]*>\s*/gi, '');

fs.writeFileSync(targetHtmlPath, html, 'utf8');

// Keep only the single self-contained HTML file inside dist-single/
for (const entry of fs.readdirSync(outDir)) {
  if (entry !== 'MyFirstAccount.html') {
    fs.rmSync(path.join(outDir, entry), {recursive: true, force: true});
  }
}

const sizeKB = (fs.statSync(targetHtmlPath).size / 1024).toFixed(1);
console.log(`\nSingle HTML built successfully: dist-single/MyFirstAccount.html (${sizeKB} KB)`);
