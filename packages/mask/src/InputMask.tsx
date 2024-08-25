import { forwardRef } from 'react';

import useConnectedRef from '@react-input/core/useConnectedRef';

import useMask from './useMask';

import type { MaskProps } from './types';
import type { InputComponent, InputComponentProps } from '@react-input/core';

export type InputMaskProps<C extends React.ComponentType | undefined = undefined> = MaskProps & InputComponentProps<C>;

function ForwardedInputMask<C extends React.ComponentType | undefined = undefined>(
  { component: Component, mask, replacement, showMask, separate, track, modify, onMask, ...props }: InputMaskProps<C>,
  forwardedRef: React.ForwardedRef<HTMLInputElement>,
): JSX.Element {
  const ref = useMask({ mask, replacement, showMask, separate, track, modify, onMask });

  const connectedRef = useConnectedRef(ref, forwardedRef);

  if (Component) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <Component ref={connectedRef} {...(props as any)} />;
  }

  return <input ref={connectedRef} {...props} />;
}

const InputMask = forwardRef(ForwardedInputMask) as InputComponent<MaskProps>;

export default InputMask;
