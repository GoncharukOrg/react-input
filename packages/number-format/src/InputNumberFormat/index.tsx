import { forwardRef } from 'react';

import useConnectedRef from '@react-input/core/useConnectedRef';

import useNumberFormat from '../useNumberFormat';

import type { NumberFormatOptions } from '../types';
import type { InputComponent, InputComponentProps } from '@react-input/core';

export type InputNumberFormatProps<C extends React.ComponentType | undefined = undefined> = NumberFormatOptions & {
  locales?: Intl.LocalesArgument;
} & InputComponentProps<C>;

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
    ...props
  }: InputNumberFormatProps<C>,
  forwardedRef: React.ForwardedRef<HTMLInputElement>,
): JSX.Element {
  const ref = useNumberFormat({
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
  });

  const connectedRef = useConnectedRef(ref, forwardedRef);

  if (Component) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unnecessary-type-assertion
    return <Component ref={connectedRef} {...(props as any)} />;
  }

  return <input ref={connectedRef} {...props} />;
}

const InputNumberFormat = forwardRef(ForwardedInputNumberFormat) as InputComponent<
  NumberFormatOptions & { locales?: Intl.LocalesArgument }
>;

export default InputNumberFormat;
