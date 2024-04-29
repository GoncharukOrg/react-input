import type { Replacement } from '../types';

export default function formatToReplacementObject(replacement: string): Replacement {
  return replacement.length > 0 ? { [replacement]: /./ } : {};
}
