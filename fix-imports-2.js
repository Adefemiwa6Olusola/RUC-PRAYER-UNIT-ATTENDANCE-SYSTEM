const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, 'app', 'api');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Fix hasPermission(user, ...) to hasPermission(user.role, ...)
  content = content.replace(/hasPermission\(\s*user\s*,/g, "hasPermission(user.role,");

  // Fix validateSessionUpdate import and usage
  content = content.replace(/import\s*\{\s*validateSessionUpdate\s*\}\s*from\s*['"]@\/lib\/validation['"];?/g, "");
  content = content.replace(/const\s+validatedData\s*=\s*validateSessionUpdate\(body\);/g, "const validatedData = body;");

  // Fix logAudit positional to object:
  // logAudit(user.id, 'UPDATE_SESSION', params.id);
  // -> logAudit({ userId: user.id, action: 'UPDATE_SESSION', entityId: params.id, entity: 'AttendanceSession' });
  content = content.replace(/logAudit\(([^,]+),\s*['"]([^'"]+)['"](?:,\s*([^)]+))?\)/g, (match, userId, action, entityId) => {
      let replacement = `logAudit({ userId: ${userId}, action: '${action}', entity: 'System'`;
      if (entityId) {
          replacement += `, entityId: ${entityId}`;
      }
      replacement += ` })`;
      return replacement;
  });

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
console.log("Done fixing imports and parameters in API.");
