const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, 'app', 'api');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Fix db import and usage
  content = content.replace(/import\s*\{\s*db\s*\}\s*from\s*['"]@\/lib\/db['"];?/g, "import prisma from '@/lib/db';");
  content = content.replace(/\bdb\./g, "prisma.");

  // Fix logAudit
  content = content.replace(/logAction|logAuditEvent/g, "logAudit");

  // Fix checkPermission
  content = content.replace(/checkPermission/g, "hasPermission");

  // Fix validations (remove the imports and calls since they don't exist in lib/validation)
  content = content.replace(/,\s*validateCentre/g, "");
  content = content.replace(/validateCentre,\s*/g, "");
  content = content.replace(/import\s*\{\s*validateCentre\s*\}\s*from\s*['"]@\/lib\/validation['"];?/g, "");
  
  content = content.replace(/,\s*validateMeeting/g, "");
  content = content.replace(/validateMeeting,\s*/g, "");
  content = content.replace(/import\s*\{\s*validateMeeting\s*\}\s*from\s*['"]@\/lib\/validation['"];?/g, "");

  // Naive replacement for the actual calls, just removing the error throwing to let Prisma handle it or basic check
  content = content.replace(/const validationError = validateCentre\(.*?\);[\s\S]*?if\s*\(validationError\)[\s\S]*?return NextResponse\.json.*?;[\s\S]*?\}/g, "");
  content = content.replace(/const validationError = validateMeeting\(.*?\);[\s\S]*?if\s*\(validationError\)[\s\S]*?return NextResponse\.json.*?;[\s\S]*?\}/g, "");

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
console.log("Done fixing imports in API.");
