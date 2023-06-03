import { forwardRef } from 'react';

import { useConnectedInputRef } from '@react-input/core';
import type { InputComponent, PropsWithComponent, PropsWithoutComponent } from '@react-input/core';

import type { NumberFormatProps } from './types';

import useNumberFormat from './useNumberFormat';

export type InputNumberFormatProps<P extends object | null = null> = NumberFormatProps &
  (P extends null ? PropsWithoutComponent : P extends object ? PropsWithComponent<P> : Record<string, never>);

function ForwardedInputNumberFormat(
  props: InputNumberFormatProps,
  forwardedInputRef: React.ForwardedRef<HTMLInputElement>
): JSX.Element;
function ForwardedInputNumberFormat<P extends object>(
  props: InputNumberFormatProps<P>,
  forwardedInputRef: React.ForwardedRef<HTMLInputElement>
): JSX.Element;
function ForwardedInputNumberFormat<P extends object>(
  {
    component: Component,
    locales,
    format,
    currency,
    currencyDisplay,
    unit,
    unitDisplay,
    signDisplay,
    groupDisplay,
    minimumIntegerDigits,
    maximumIntegerDigits,
    minimumFractionDigits,
    maximumFractionDigits,
    onNumberFormat,
    ...props
  }: InputNumberFormatProps | InputNumberFormatProps<P>,
  forwardedInputRef: React.ForwardedRef<HTMLInputElement>
): JSX.Element {
  const inputRef = useNumberFormat({
    locales,
    format,
    currency,
    currencyDisplay,
    unit,
    unitDisplay,
    signDisplay,
    groupDisplay,
    minimumIntegerDigits,
    maximumIntegerDigits,
    minimumFractionDigits,
    maximumFractionDigits,
    onNumberFormat,
  });

  const connectedInputRef = useConnectedInputRef(inputRef, forwardedInputRef);

  if (Component) {
    return <Component ref={connectedInputRef} {...props} />;
  }

  return <input ref={connectedInputRef} {...props} />;
}

const InputNumberFormat = forwardRef(ForwardedInputNumberFormat) as unknown as InputComponent<NumberFormatProps>;

export default InputNumberFormat;
