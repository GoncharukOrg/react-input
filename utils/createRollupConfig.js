const babel = require('@rollup/plugin-babel').default;
const commonjs = require('@rollup/plugin-commonjs').default;
const nodeResolve = require('@rollup/plugin-node-resolve').default;
const terser = require('@rollup/plugin-terser').default;

const readdir = require('./readdir.js');

const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.es6', '.es', '.mjs'];

const reduceFromDir = (/** @type {import("fs").PathLike} */ dir) => {
  return readdir(dir)
    .filter((path) => !/\.stories\.[^/]+$|\.test\.[^/]+$|types.ts$|\.d\.ts$/gm.test(path))
    .reduce((prev, path) => {
      return { ...prev, [path.replace(/^\.\/src\/|\.[^/]+$/g, '')]: path };
    }, {});
};

/**
 * @param {string[]} entries
 */
function createRollupConfig(...entries) {
  const input = entries.reduce((prev, path) => {
    const _entries = /\.[^/]+$/.test(path) ? { [path.replace(/^src\/|\.[^/]+$/g, '')]: path } : reduceFromDir(path);

    return { ...prev, ..._entries };
  }, {});

  return {
    input,
    output: [
      {
        format: 'es',
        dir: 'dist/module',
        entryFileNames: '[name].js',
        chunkFileNames: 'helpers-[hash].js',
        hoistTransitiveImports: false,
      },
      {
        format: 'cjs',
        dir: 'dist/node',
        entryFileNames: '[name].cjs',
        chunkFileNames: 'helpers-[hash].cjs',
        hoistTransitiveImports: false,
      },
    ],
    external: [/^react(\/.*)?$/, /^react-dom(\/.*)?$/, /^@react-input\/core(\/.*)?$/],
    plugins: [
      nodeResolve({
        extensions: EXTENSIONS,
      }),
      commonjs(),
      babel({
        root: '../..',
        babelHelpers: 'bundled',
        extensions: EXTENSIONS,
      }),
      terser(),
    ],
  };
}

module.exports = createRollupConfig;
