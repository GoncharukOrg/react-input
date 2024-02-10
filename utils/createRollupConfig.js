const { babel } = require('@rollup/plugin-babel');
const commonjs = require('@rollup/plugin-commonjs').default;
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const terser = require('@rollup/plugin-terser').default;
const typescript = require('@rollup/plugin-typescript').default;

const output = {
  module: {
    format: 'es',
    dir: 'dist',
  },
  node: {
    format: 'cjs',
    dir: 'dist/node',
    entryFileNames: '[name].cjs',
    chunkFileNames: '[name]-[hash].cjs',
  },
};

/**
 * @param {'node' | 'module'} env
 * @param {Record<string, string> | string[]} input
 */
function createRollupConfig(env, input) {
  return {
    input,
    output: output[env],
    external: [/^react(\/.*)?$/, /^react-dom(\/.*)?$/, /^@react-input\/core(\/.*)?$/],
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({
        tsconfig: `tsconfig.${env}.json`,
      }),
      babel({
        babelHelpers: 'bundled',
      }),
      terser(),
    ],
  };
}

module.exports = createRollupConfig;
