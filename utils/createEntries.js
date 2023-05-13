const fs = require('fs');
const util = require('util');

const getPaths = require('./getPaths');

const paths = getPaths('./src');
const resolvedPaths = paths.filter((path) => {
  return !/^\.\/src\/index.tsx?$|\.stories\.tsx?$|\.test\.tsx?$|types.ts$|\.d\.ts$/gm.test(path);
});

const imports = resolvedPaths.map((path) => {
  const normalizedPath = path.replace(/^\.\/src\/|\.tsx?$/g, '');
  const moduleName = normalizedPath.replace(/^(.*\/)?/g, '');

  return `export { default as ${moduleName} } from './${normalizedPath}';\n`;
});

util.promisify(fs.writeFile)('./src/index.ts', imports.join(''), { encoding: 'utf-8' });
