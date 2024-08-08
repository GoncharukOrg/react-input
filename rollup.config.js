const babel = require('@rollup/plugin-babel').default;
const commonjs = require('@rollup/plugin-commonjs').default;
const nodeResolve = require('@rollup/plugin-node-resolve').default;
const terser = require('@rollup/plugin-terser').default;

const readdir = require('./utils/readdir.js');

const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.es6', '.es', '.mjs'];
const ENTRIES = {
  '@react-input/core': ['./src'],
  '@react-input/mask': ['src/index.ts', 'src/InputMask.tsx', 'src/Mask.ts', 'src/useMask.ts', 'src/utils.ts'],
  '@react-input/number-format': ['src/index.ts', 'src/InputNumberFormat.tsx', 'src/useNumberFormat.ts'],
};

const reduceFromDir = (/** @type {import("fs").PathLike} */ dir) => {
  return readdir(dir)
    .filter((path) => !/\.stories\.[^/]+$|\.test\.[^/]+$|types.ts$|\.d\.ts$/gm.test(path))
    .reduce((prev, path) => {
      return { ...prev, [path.replace(/^\.\/src\/|\.[^/]+$/g, '')]: path };
    }, {});
};

function config() {
  const { npm_package_name } = process.env;

  if (!npm_package_name) {
    throw new Error('');
  }

  // @ts-ignore
  const input = ENTRIES[npm_package_name].reduce((prev, path) => {
    if (/\.[^/]+$/.test(path)) {
      return { ...prev, [path.replace(/^src\/|\.[^/]+$/g, '')]: path };
    }

    return { ...prev, ...reduceFromDir(path) };
  }, {});

  return {
    input,
    output: [
      {
        format: 'es',
        dir: 'dist/module',
        entryFileNames: '[name].js',
      },
      {
        format: 'cjs',
        dir: 'dist/node',
        entryFileNames: '[name].cjs',
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

module.exports = config;
