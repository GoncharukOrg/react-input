import { execSync } from 'child_process';
import fs from 'fs';

import readdir from '../utils/readdir';
import style from '../utils/style';

/**
 * Remove `dist`
 */

fs.rmSync('./dist', { recursive: true, force: true });

/**
 * Rollup build
 */

execSync('rollup --config rollup.config.js');

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
 * Restore `dist`
 */

if (fs.existsSync('./dist/module')) {
  throw new Error('The folder "module" already exists!');
}

fs.mkdirSync('./dist/module');

fs.readdirSync('./dist').forEach((relativePath) => {
  if (relativePath !== 'module' && relativePath !== 'node' && relativePath !== '@types') {
    fs.renameSync(`./dist/${relativePath}`, `./dist/module/${relativePath}`);
  }
});

/**
 * Console
 */

const packageName = `${process.env.npm_package_name}@${process.env.npm_package_version}`;

console.log(
  `\n${style.fg.yellow}The package ${style.fg.blue}${packageName} ${style.fg.yellow}was successfully built!\n`,
  style.reset,
);
