import type { NumberFormatOptions, ResolvedNumberFormatOptions } from '../types';

interface TempResolved extends Partial<Intl.ResolvedNumberFormatOptions> {
  localeMatcher?: string;
  numberingSystem?: string;
  roundingIncrement?: 1 | 2 | 5 | 10 | 20 | 25 | 50 | 100 | 200 | 250 | 500 | 1000 | 2000 | 2500 | 5000 | undefined;
  roundingMode?:
    | 'ceil'
    | 'floor'
    | 'expand'
    | 'trunc'
    | 'halfCeil'
    | 'halfFloor'
    | 'halfExpand'
    | 'halfTrunc'
    | 'halfEven';
  roundingPriority?: 'auto' | 'morePrecision' | 'lessPrecision';
  trailingZeroDisplay?: 'auto' | 'stripIfInteger';
}

export default function resolveOptions(
  locales: Intl.LocalesArgument,
  { format, groupDisplay, maximumIntegerDigits = 21, ...options }: NumberFormatOptions,
) {
  const resolvedOptions = new Intl.NumberFormat(locales, {
    ...options,
    style: format,
    useGrouping: groupDisplay,
  }).resolvedOptions() as unknown as ResolvedNumberFormatOptions;

  resolvedOptions.format = (resolvedOptions as unknown as Intl.ResolvedNumberFormatOptions).style;
  resolvedOptions.groupDisplay = (resolvedOptions as unknown as Intl.ResolvedNumberFormatOptions).useGrouping;
  resolvedOptions.maximumIntegerDigits = maximumIntegerDigits;

  if (resolvedOptions.maximumIntegerDigits < resolvedOptions.minimumIntegerDigits) {
    resolvedOptions.maximumIntegerDigits = resolvedOptions.minimumIntegerDigits;
  }

  // Удаляем из `resolvedOptions` неиспользуемые свойства
  const tempResolvedOptions = resolvedOptions as unknown as TempResolved;

  delete tempResolvedOptions.style;
  delete tempResolvedOptions.currencySign;
  delete tempResolvedOptions.useGrouping;
  delete tempResolvedOptions.minimumSignificantDigits;
  delete tempResolvedOptions.maximumSignificantDigits;
  delete tempResolvedOptions.compactDisplay;
  delete tempResolvedOptions.notation;
  delete tempResolvedOptions.numberingSystem;
  delete tempResolvedOptions.localeMatcher;
  delete tempResolvedOptions.roundingIncrement;
  delete tempResolvedOptions.roundingMode;
  delete tempResolvedOptions.roundingPriority;
  delete tempResolvedOptions.trailingZeroDisplay;

  return resolvedOptions;
}
