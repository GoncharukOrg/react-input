import fs from 'fs';

import readdir from '../utils/readdir';

const paths = readdir('./src');

const resolvedPaths = paths.filter((path) => {
  return !/index.[^/]+$|\.stories\.[^/]+$|\.test\.[^/]+$|types\.ts$|\.d\.ts$/gm.test(path);
});

const imports = resolvedPaths.map((path) => {
  const normalizedPath = path.replace(/^\.\/src\/|\.[^/]+$/g, '');
  const moduleName = normalizedPath.replace(/^(.*\/)?/g, '');

  return `export { default as ${moduleName} } from './${normalizedPath}';\n`;
});

fs.writeFileSync('./src/index.ts', `${imports.join('')}\nexport type * from './types';\n`, { encoding: 'utf-8' });
