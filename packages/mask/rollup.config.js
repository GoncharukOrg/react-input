import createRollupConfig from '../../utils/createRollupConfig.js';

const input = ['src/index.ts', 'src/InputMask.tsx', 'src/useMask.ts'];

export default [createRollupConfig('module', input), createRollupConfig('node', input)];
