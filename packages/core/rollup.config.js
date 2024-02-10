import createRollupConfig from '../../utils/createRollupConfig.js';
import reduce from '../../utils/reduce.js';

export default [createRollupConfig('module', reduce('./src')), createRollupConfig('node', reduce('./src'))];
