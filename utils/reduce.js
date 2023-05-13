const getPaths = require('./getPaths');

function reduce(dir) {
  return Object.fromEntries(
    getPaths(dir)
      .filter((path) => !/\.stories\.tsx?$|\.test\.tsx?$|types.ts$|\.d\.ts$/gm.test(path))
      .map((path) => [path.replace(/^\.\/src\/|\.tsx?$/gm, ''), path])
  );
}

module.exports = reduce;
