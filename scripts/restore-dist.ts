import fs from 'fs';

if (fs.existsSync('./dist/module')) {
  throw new Error('The folder "module" already exists!');
}

fs.mkdirSync('./dist/module');

fs.readdirSync('./dist').forEach((relativePath) => {
  if (relativePath !== 'module' && relativePath !== 'node' && relativePath !== '@types') {
    fs.renameSync(`./dist/${relativePath}`, `./dist/module/${relativePath}`);
  }
});
