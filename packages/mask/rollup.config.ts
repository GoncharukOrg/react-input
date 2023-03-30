import rollupConfig from '../../rollup.config';
import rollupConfigNode from '../../rollup.config.node';

const input = ['src/index.ts', 'src/InputMask.tsx', 'src/useMask.ts'];

export default [
  { ...rollupConfig, input },
  { ...rollupConfigNode, input },
];
