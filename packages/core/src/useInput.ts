import { useMemo, useRef } from 'react';

import Input from './Input';
import createProxy from './createProxy';

import type { InputOptions } from './types';

/**
 * Хук контроля события изменения ввода позволяет выполнять логику и изменять
 * аттрибуты `input` элемента на определённых этапах трекинга события.
 * @param param
 * @returns
 */
export default function useInput({ type, init, tracking }: InputOptions) {
  const ref = useRef<HTMLInputElement | null>(null);

  const options = useRef({ type, init, tracking });

  options.current.type = type;
  options.current.init = init;
  options.current.tracking = tracking;

  return useMemo(() => {
    return createProxy(ref, new Input(options.current));
  }, []);
}
