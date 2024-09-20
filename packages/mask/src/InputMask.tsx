// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import React, { forwardRef } from 'react';

import { useConnectedInputRef } from '@react-input/core';

import useMask from './useMask';

import type { MaskProps } from './types';
import type { InputComponent, InputComponentProps } from '@react-input/core';

export type InputMaskProps<C extends React.ComponentType | undefined = undefined> = MaskProps & InputComponentProps<C>;

function ForwardedInputMask<C extends React.ComponentType | undefined = undefined>(
  { component: Component, mask, replacement, showMask, separate, track, modify, onMask, ...props }: InputMaskProps<C>,
  forwardedInputRef: React.ForwardedRef<HTMLInputElement>,
): JSX.Element {
  const inputRef = useMask({ mask, replacement, showMask, separate, track, modify, onMask });

  const connectedInputRef = useConnectedInputRef(inputRef, forwardedInputRef);

  if (Component) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unnecessary-type-assertion
    return <Component ref={connectedInputRef} {...(props as any)} />;
  }

  return <input ref={connectedInputRef} {...props} />;
}

const InputMask = forwardRef(ForwardedInputMask) as InputComponent<MaskProps>;

export default InputMask;
