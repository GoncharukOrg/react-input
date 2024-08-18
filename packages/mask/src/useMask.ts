import { useMemo, useRef } from 'react';

import createProxy from '@react-input/core/createProxy';

import Mask from './Mask';

import type { MaskProps } from './types';

export default function useMask({ mask, replacement, showMask, separate, track, modify, onMask }: MaskProps = {}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const props = useRef({
    options: { mask, replacement, showMask, separate, track, modify },
    handler: onMask,
  });

  props.current.options.mask = mask;
  props.current.options.replacement = replacement;
  props.current.options.showMask = showMask;
  props.current.options.separate = separate;
  props.current.options.track = track;
  props.current.options.modify = modify;
  props.current.handler = onMask;

  return useMemo(() => {
    const mask = new Mask(props.current.options);

    mask.onmask = (event) => {
      props.current.handler?.(event);
    };

    return createProxy(inputRef, mask);
  }, []);
}
