const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, 'app', 'api');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace user.id with user.userId when it's used inside the API routes
  // (because getCurrentUser() returns TokenPayload which has userId, not id)
  content = content.replace(/\buser\.id\b/g, "user.userId");

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      processFile(fullPath);
    }
  }
}

walkDir(apiDir);
console.log("Done fixing user.id to user.userId in API.");
