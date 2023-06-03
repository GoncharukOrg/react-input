/* eslint-disable import/no-relative-packages */
/* eslint-disable import/extensions */
import createRollupConfig from '../../utils/createRollupConfig.js';

const input = ['src/index.ts', 'src/InputNumberFormat.tsx', 'src/useNumberFormat.ts'];

export default [createRollupConfig('module', { input }), createRollupConfig('node', { input })];
