import createRollupConfig from '../../utils/createRollupConfig.js';
import readdir from '../../utils/readdir.js';

/**
 * @param {import("fs").PathLike} dir
 */
const reduce = (dir) => {
  return Object.fromEntries(
    readdir(dir)
      .filter((path) => !/\.stories\.tsx?$|\.test\.tsx?$|types.ts$|\.d\.ts$/gm.test(path))
      .map((path) => [path.replace(/^\.\/src\/|\.tsx?$/gm, ''), path]),
  );
};

export default [createRollupConfig('module', reduce('./src')), createRollupConfig('node', reduce('./src'))];
