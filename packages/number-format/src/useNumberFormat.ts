import { useMemo, useRef } from 'react';

import createProxy from '@react-input/core/createProxy';

import NumberFormat from './NumberFormat';

import type { NumberFormatEvent, NumberFormatProps } from './types';

export default function useNumberFormat({
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
  // minimumSignificantDigits,
  // maximumSignificantDigits,
  onNumberFormat,
}: NumberFormatProps = {}) {
  const ref = useRef<HTMLInputElement | null>(null);

  const props = useRef({
    locales,
    options: {
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
    },
    handler: onNumberFormat,
  });

  props.current.locales = locales;
  props.current.options.format = format;
  props.current.options.currency = currency;
  props.current.options.currencyDisplay = currencyDisplay;
  props.current.options.unit = unit;
  props.current.options.unitDisplay = unitDisplay;
  props.current.options.signDisplay = signDisplay;
  props.current.options.groupDisplay = groupDisplay;
  props.current.options.minimumIntegerDigits = minimumIntegerDigits;
  props.current.options.maximumIntegerDigits = maximumIntegerDigits;
  props.current.options.minimumFractionDigits = minimumFractionDigits;
  props.current.options.maximumFractionDigits = maximumFractionDigits;
  props.current.handler = onNumberFormat;

  return useMemo(() => {
    const numberFormat = new NumberFormat(props.current.locales, props.current.options);

    return createProxy(ref, numberFormat, {
      type: 'number-format',
      handler: (event) => {
        props.current.handler?.(event as NumberFormatEvent);
      },
    });
  }, []);
}
