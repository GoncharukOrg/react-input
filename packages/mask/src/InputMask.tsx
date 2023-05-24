import { forwardRef } from 'react';

import { useConnectedInputRef } from '@react-input/core';
import type { InputComponent, PropsWithComponent, PropsWithoutComponent } from '@react-input/core';

import type { MaskProps } from './types';

import useMask from './useMask';

export type InputMaskProps<P extends object | null = null> = MaskProps &
  (P extends null ? PropsWithoutComponent : P extends object ? PropsWithComponent<P> : {});

function InputMaskComponent(
  props: InputMaskProps,
  forwardedInputRef: React.ForwardedRef<HTMLInputElement>
): JSX.Element;
// eslint-disable-next-line no-redeclare
function InputMaskComponent<P extends object>(
  props: InputMaskProps<P>,
  forwardedInputRef: React.ForwardedRef<HTMLInputElement>
): JSX.Element;
// eslint-disable-next-line no-redeclare
function InputMaskComponent<P extends object>(
  {
    component: Component,
    mask,
    replacement,
    showMask,
    separate,
    modify,
    onMask,
    ...props
  }: InputMaskProps | InputMaskProps<P>,
  forwardedInputRef: React.ForwardedRef<HTMLInputElement>
): JSX.Element {
  const inputRef = useMask({ mask, replacement, showMask, separate, modify, onMask });

  const connectedInputRef = useConnectedInputRef(inputRef, forwardedInputRef);

  if (Component) {
    return <Component ref={connectedInputRef} {...props} />;
  }

  return <input ref={connectedInputRef} {...props} />;
}

const InputMask = forwardRef(InputMaskComponent) as unknown as InputComponent<MaskProps>;

export default InputMask;
