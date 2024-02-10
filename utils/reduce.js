const readdir = require('./readdir');

/**
 * @param {import("fs").PathLike} dir
 */
function reduce(dir) {
  return Object.fromEntries(
    readdir(dir)
      .filter((path) => !/\.stories\.tsx?$|\.test\.tsx?$|types.ts$|\.d\.ts$/gm.test(path))
      .map((path) => [path.replace(/^\.\/src\/|\.tsx?$/gm, ''), path]),
  );
}

module.exports = reduce;
