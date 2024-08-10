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
export default function useInput<D = unknown>({
  init,
  tracking,
  eventType,
  eventHandler,
}: InputOptions<D>): React.MutableRefObject<HTMLInputElement | null> {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const options = useRef({
    init,
    tracking,
    eventType,
    eventHandler,
  });

  options.current.init = init;
  options.current.tracking = tracking;
  options.current.eventType = eventType;
  options.current.eventHandler = eventHandler;

  return useMemo(() => {
    const input = new Input(options.current);

    return createProxy(inputRef, input);
  }, []);
}
