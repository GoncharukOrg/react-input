import { useMemo, useRef } from 'react';

import { createProxy } from '@react-input/core';

import NumberFormat from './NumberFormat';

import type { NumberFormatOptions } from './types';

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
}: NumberFormatOptions & { locales?: Intl.LocalesArgument } = {}) {
  const $ref = useRef<HTMLInputElement | null>(null);
  const $locales = useRef(locales);
  const $options = useRef({
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

  $locales.current = locales;
  $options.current.format = format;
  $options.current.currency = currency;
  $options.current.currencyDisplay = currencyDisplay;
  $options.current.unit = unit;
  $options.current.unitDisplay = unitDisplay;
  $options.current.signDisplay = signDisplay;
  $options.current.groupDisplay = groupDisplay;
  $options.current.minimumIntegerDigits = minimumIntegerDigits;
  $options.current.maximumIntegerDigits = maximumIntegerDigits;
  $options.current.minimumFractionDigits = minimumFractionDigits;
  $options.current.maximumFractionDigits = maximumFractionDigits;

  return useMemo(() => {
    return createProxy($ref, new NumberFormat($locales.current, $options.current));
  }, []);
}
