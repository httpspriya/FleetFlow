const fs = require('fs');
const path = require('path');

const root = process.cwd();
const src = path.join(root, 'generated');
const dest = path.join(root, 'dist', 'generated');

if (fs.existsSync(src)) {
  fs.cpSync(src, dest, { recursive: true });
  console.log('Copied generated Prisma client to dist/generated');
}
