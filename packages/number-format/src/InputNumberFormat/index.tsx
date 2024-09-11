import { forwardRef } from 'react';

import { useConnectedInputRef } from '@react-input/core';

import useNumberFormat from '../useNumberFormat';

import type { NumberFormatProps } from '../types';
import type { InputComponent, InputComponentProps } from '@react-input/core';

export type InputNumberFormatProps<C extends React.ComponentType | undefined = undefined> = NumberFormatProps &
  InputComponentProps<C>;

function ForwardedInputNumberFormat<C extends React.ComponentType | undefined = undefined>(
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
  }: InputNumberFormatProps<C>,
  forwardedInputRef: React.ForwardedRef<HTMLInputElement>,
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <Component ref={connectedInputRef} {...(props as any)} />;
  }

  return <input ref={connectedInputRef} {...props} />;
}

const InputNumberFormat = forwardRef(ForwardedInputNumberFormat) as InputComponent<NumberFormatProps>;

export default InputNumberFormat;
