const fs = require('fs');
const util = require('util');

const getPaths = require('../utils/getPaths');

const paths = getPaths('./src');
const resolvedPaths = paths.filter((path) => {
  return !/^\.\/src\/index.tsx?$|\.stories\.tsx?$|\.test\.tsx?$|\.d\.ts$/gm.test(path);
});

const allImportTypes = [];

const imports = resolvedPaths.map((path) => {
  const normalizedPath = path.replace(/^\.\/src\/|\.tsx?$/g, '');
  const moduleName = normalizedPath.replace(/^(.*\/)?/g, '');

  if (/types.ts$/gm.test(path)) {
    const importTypes = fs
      .readFileSync(path, 'utf8')
      .match(/(?<=export (?:type|interface) )[a-zA-z]+/gm)
      .reduce((prev, typeName) => `${prev}  ${typeName},\n`, '');

    if (importTypes) {
      allImportTypes.push(`export type {\n${importTypes}} from './${normalizedPath}';\n`);
    }

    return '';
  }

  return `export { default as ${moduleName} } from './${normalizedPath}';\n`;
});

util.promisify(fs.writeFile)(
  './src/index.ts',
  `${imports.join('')}\n${allImportTypes.join('\n')}`,
  { encoding: 'utf-8' }
);
