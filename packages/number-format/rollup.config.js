/* eslint-disable import/no-relative-packages */
import createRollupConfig from '../../createRollupConfig.js';

const input = ['src/index.ts', 'src/InputNumberFormat.tsx', 'src/useNumberFormat.ts'];

export default [createRollupConfig('module', { input }), createRollupConfig('node', { input })];
