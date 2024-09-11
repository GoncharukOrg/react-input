const babel = require('@rollup/plugin-babel').default;
const commonjs = require('@rollup/plugin-commonjs').default;
const nodeResolve = require('@rollup/plugin-node-resolve').default;
const replace = require('@rollup/plugin-replace').default;
const terser = require('@rollup/plugin-terser').default;

const readdir = require('./utils/readdir.js');

const { npm_package_name } = process.env;

if (!npm_package_name) {
  throw new Error('');
}

const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.es6', '.es', '.mjs'];
const ENTRIES = {
  '@react-input/core': {
    react: {
      input: ['./src'],
    },
  },
  '@react-input/mask': {
    cdn: {
      input: 'src/Mask.ts',
      output: {
        name: 'Mask',
      },
    },
    react: {
      input: ['src/index.ts', 'src/Mask.ts', 'src/useMask.ts', 'src/utils.ts', 'src/InputMask/index.tsx'],
    },
  },
  '@react-input/number-format': {
    cdn: {
      input: 'src/NumberFormat.ts',
      output: {
        name: 'NumberFormat',
      },
    },
    react: {
      input: [
        'src/index.ts',
        'src/NumberFormat.ts',
        'src/useNumberFormat.ts',
        'src/utils.ts',
        'src/InputNumberFormat/index.tsx',
      ],
    },
  },
};

const reduceFromDir = (/** @type {import("fs").PathLike} */ dir) => {
  return readdir(dir)
    .filter((path) => !/\.stories\.[^/]+$|\.test\.[^/]+$|types.ts$|\.d\.ts$/gm.test(path))
    .reduce((prev, path) => {
      return { ...prev, [path.replace(/^\.\/src\/|\.[^/]+$/g, '')]: path };
    }, {});
};

const reduceEntries = (/** @type {string[]} */ entries) => {
  return entries.reduce((prev, path) => {
    if (/\.[^/]+$/.test(path)) {
      return { ...prev, [path.replace(/^src\/|\.[^/]+$/g, '')]: path };
    }

    return { ...prev, ...reduceFromDir(path) };
  }, {});
};

const plugins = (/** @type {'cdn'|'react'} */ output) => [
  replace({
    preventAssignment: true,
    values: {
      'process.env.__OUTPUT__': JSON.stringify(output),
      ...(output === 'cdn' ? { 'process.env.NODE_ENV': JSON.stringify('production') } : {}),
    },
  }),
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
];

function rollup() {
  // @ts-expect-error
  const entries = ENTRIES[npm_package_name];
  const config = [];

  if (entries.cdn) {
    config.push({
      input: entries.cdn.input,
      output: {
        format: 'umd',
        file: `dist/${entries.cdn.output.name}.min.js`,
        name: `ReactInput.${entries.cdn.output.name}`,
      },
      plugins: plugins('cdn'),
    });
  }

  if (entries.react) {
    config.push({
      input: reduceEntries(entries.react.input),
      output: [
        {
          format: 'es',
          dir: 'dist/module',
          entryFileNames: '[name].js',
          hoistTransitiveImports: false,
        },
        {
          format: 'cjs',
          dir: 'dist/node',
          entryFileNames: '[name].cjs',
          hoistTransitiveImports: false,
        },
      ],
      external: [/^react(\/.*)?$/, /^react-dom(\/.*)?$/, /^@react-input\/core(\/.*)?$/],
      plugins: plugins('react'),
    });
  }

  return config;
}

module.exports = rollup;
