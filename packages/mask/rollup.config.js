/* eslint-disable import/no-relative-packages */
import createRollupConfig from '../../createRollupConfig.js';

const input = ['src/index.ts', 'src/InputMask.tsx', 'src/useMask.ts'];

export default [createRollupConfig('module', { input }), createRollupConfig('node', { input })];
