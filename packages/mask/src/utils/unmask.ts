import type { Replacement } from '../types';

interface Options {
  start?: number;
  end?: number;
  mask: string;
  replacement: Replacement;
  separate: boolean;
}

export default function unmask(value: string, { start = 0, end, mask, replacement, separate }: Options) {
  const slicedValue = value.slice(start, end);
  const slicedMask = mask.slice(start, end);

  let unmaskedValue = '';

  for (let i = 0; i < slicedMask.length; i++) {
    const isReplacementKey = Object.prototype.hasOwnProperty.call(replacement, slicedMask[i]);

    if (isReplacementKey && slicedValue[i] !== undefined && slicedValue[i] !== slicedMask[i]) {
      unmaskedValue += slicedValue[i];
    } else if (isReplacementKey && separate) {
      unmaskedValue += slicedMask[i];
    }
  }

  return unmaskedValue;
}
