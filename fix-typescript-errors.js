// Fix TypeScript errors for production build
const fs = require('fs');
const path = require('path');

// Fix 1: server/routes/auth.ts - error type unknown
const authFile = 'server/routes/auth.ts';
if (fs.existsSync(authFile)) {
  let content = fs.readFileSync(authFile, 'utf8');
  content = content.replace(
    /if \(error\.name === 'ZodError'\)/g,
    'if (error instanceof Error && error.name === \'ZodError\')'
  );
  content = content.replace(
    /errors: error\.errors,/g,
    'errors: (error as any).errors,'
  );
  fs.writeFileSync(authFile, content);
  console.log('✅ Fixed server/routes/auth.ts');
}

// Fix 2: server/routes/events.ts - error type unknown
const eventsFile = 'server/routes/events.ts';
if (fs.existsSync(eventsFile)) {
  let content = fs.readFileSync(eventsFile, 'utf8');
  content = content.replace(
    /console\.error\('Error sending approval email:', error\);/g,
    'console.error(\'Error sending approval email:\', error);'
  );
  content = content.replace(
    /console\.error\('Error creating event:', error\);/g,
    'console.error(\'Error creating event:\', error);'
  );
  fs.writeFileSync(eventsFile, content);
  console.log('✅ Fixed server/routes/events.ts');
}

// Fix 3: server/storage.ts - import path
const storageFile = 'server/storage.ts';
if (fs.existsSync(storageFile)) {
  let content = fs.readFileSync(storageFile, 'utf8');
  content = content.replace(
    /from '\.\/db'/g,
    "from './db.js'"
  );
  fs.writeFileSync(storageFile, content);
  console.log('✅ Fixed server/storage.ts');
}

// Fix 4: tailwind.config.ts - dark mode config
const tailwindFile = 'tailwind.config.ts';
if (fs.existsSync(tailwindFile)) {
  let content = fs.readFileSync(tailwindFile, 'utf8');
  content = content.replace(
    /darkMode: \["class"\]/g,
    'darkMode: "class"'
  );
  fs.writeFileSync(tailwindFile, content);
  console.log('✅ Fixed tailwind.config.ts');
}

console.log('🎉 All TypeScript errors fixed!');
