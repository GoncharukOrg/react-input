// ES5
// - `style`?: "decimal" | "currency" | "percent" | "unit";
// - `currency`?: string;
// - `useGrouping`?: boolean; (changed on `groupDisplay`)
// - `minimumIntegerDigits`?: number;
// - `minimumFractionDigits`?: number;
// - `maximumFractionDigits`?: number;

// ES2020
// - `signDisplay`?: "auto" | "negative" | "never" | "always" | "exceptZero";
// - `unit`?: string;
// - `unitDisplay`?: "short" | "long" | "narrow";
// - `currencyDisplay`?: "symbol" | "narrowSymbol" | "code" | "name";

// ES5 **excluded**
// - `localeMatcher`?: string;
// - `currencySign`?: "standard" | "accounting";
// - `minimumSignificantDigits`?: number;
// - `maximumSignificantDigits`?: number;

// ES2020 **excluded**
// - `compactDisplay`?: "short" | "long";
// - `notation`?: "standard" | "scientific" | "engineering" | "compact";
// - `numberingSystem`?: string;
// - `roundingIncrement`?: number;
// - `roundingMode`?: "ceil" | "floor" | "expand" | "trunc" | "halfCeil" | "halfFloor" | "halfExpand" | "halfTrunc" | "halfEven";
// - `roundingPriority`?: "auto" | "morePrecision" | "lessPrecision";
// - `trailingZeroDisplay`?: "auto" | "stripIfInteger";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ResolveOptions<T extends Record<string, any>> = Pick<
  T,
  | 'currency'
  | 'currencyDisplay'
  | 'unit'
  | 'unitDisplay'
  | 'signDisplay'
  | 'minimumIntegerDigits'
  | 'minimumFractionDigits'
  | 'maximumFractionDigits'
  // | 'minimumSignificantDigits'
  // | 'maximumSignificantDigits'
>;

export interface IncludedOptions {
  format: Intl.NumberFormatOptions['style'];
  groupDisplay: Intl.NumberFormatOptions['useGrouping'];
  maximumIntegerDigits: number;
}

export type NumberFormatOptions = ResolveOptions<Intl.NumberFormatOptions> & Partial<IncludedOptions>;

export type ResolvedNumberFormatOptions = ResolveOptions<Intl.ResolvedNumberFormatOptions> & IncludedOptions;

export interface LocalizedNumberFormatValues {
  signBackwards: boolean;
  minusSign: string;
  decimal: string;
  digits: string;
}
