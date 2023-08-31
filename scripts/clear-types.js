const fs = require('fs');

const getPaths = require('../utils/getPaths');

const nodePaths = getPaths('./dist/node');
const typesPaths = getPaths('./dist/@types');

typesPaths.forEach((path) => {
  const normalizedPath = path.replace(/^\.\/dist\/@types/, './dist/node').replace(/d\.ts$/, 'cjs');

  if (!nodePaths.includes(normalizedPath) && !/\/types\.d\.ts$/.test(path)) {
    const dirPath = path.replace(/\/[^/]*$/gm, '');

    fs.rmSync(path);

    if (fs.readdirSync(dirPath).length === 0) {
      fs.rmdirSync(dirPath);
    }
  }
});
