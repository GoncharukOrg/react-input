import rollupConfig from '../../rollup.config';
import rollupConfigNode from '../../rollup.config.node';

const input = ['src/index.ts', 'src/InputNumberFormat.tsx', 'src/useNumberFormat.ts'];

export default [
  { ...rollupConfig, input },
  { ...rollupConfigNode, input },
];
