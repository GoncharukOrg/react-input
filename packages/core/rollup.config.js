/* eslint-disable import/no-relative-packages */
/* eslint-disable import/extensions */
import createRollupConfig from '../../utils/createRollupConfig.js';
import reduce from '../../utils/reduce.js';

export default [
  createRollupConfig('module', { input: reduce('./src') }),
  createRollupConfig('node', { input: reduce('./src') }),
];
