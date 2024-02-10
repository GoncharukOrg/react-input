import fs from 'fs';

import readdir from '../utils/readdir';

const nodePaths = readdir('./dist/node');
const typesPaths = readdir('./dist/@types');

typesPaths.forEach((path) => {
  const normalizedPath = path.replace(/^\.\/dist\/@types/, './dist/node').replace(/d\.ts$/, 'cjs');

  if (!nodePaths.includes(normalizedPath) && !path.endsWith('/types.d.ts')) {
    const dirPath = path.replace(/\/[^/]*$/gm, '');

    fs.rmSync(path);

    if (fs.readdirSync(dirPath).length === 0) {
      fs.rmdirSync(dirPath);
    }
  }
});
