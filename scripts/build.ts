import { execSync } from 'child_process';
import fs from 'fs';

import readdir from '../utils/readdir';
import style from '../utils/style';

const { npm_package_name } = process.env;

if (!npm_package_name) {
  throw new Error('');
}

/**
 * Remove `dist`
 */

fs.rmSync('./dist', { recursive: true, force: true });

/**
 * Rollup build
 */

execSync('rollup --config rollup.config.js');

/**
 * Declare types
 */

execSync(
  `tsc src/index.ts ${npm_package_name === '@react-input/core' ? '--removeComments' : ''} --declaration --emitDeclarationOnly --jsx react-jsx --rootDir src --outDir dist/@types`,
);

/**
 * Clear types
 */

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

/**
 * Create package.json
 */

{
  const map = {
    '@react-input/mask': 'InputMask',
    '@react-input/number-format': 'InputNumberFormat',
  };

  if (npm_package_name === '@react-input/mask' || npm_package_name === '@react-input/number-format') {
    for (const type of ['node', 'module']) {
      fs.writeFileSync(
        `./dist/${type}/${map[npm_package_name]}/package.json`,
        JSON.stringify(
          {
            sideEffects: false,
            type: type === 'module' ? 'module' : undefined,
            types: `../../@types/${map[npm_package_name]}/index.d.ts`,
            module: type === 'module' ? './index.js' : `../../module/${map[npm_package_name]}/index.js`,
            main: type === 'node' ? './index.cjs' : `../../node/${map[npm_package_name]}/index.cjs`,
          },
          null,
          2,
        ),
      );
    }
  }
}

/**
 * Console
 */

const packageName = `${process.env.npm_package_name}@${process.env.npm_package_version}`;

console.log(
  `\n${style.fg.yellow}The package ${style.fg.blue}${packageName} ${style.fg.yellow}was successfully built!\n`,
  style.reset,
);
