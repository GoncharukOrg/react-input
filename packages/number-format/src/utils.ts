import _filter from './utils/filter';
import _format from './utils/format';
import _localizeValues from './utils/localizeValues';
import _normalize from './utils/normalize';
import _resolveOptions from './utils/resolveOptions';

import type { NumberFormatOptions } from './types';

/**
 * Formats the value using the specified locales and options (see "[Utils](https://github.com/GoncharukOrg/react-input/tree/main/packages/number-format#format)").
 *
 * The result is exactly the same as the value received from the input.
 * Useful when you want to get a formatted value without raising an input event.
 *
 * Since `InputNumberFormat` works exactly like the `input` element, `InputNumberFormat`
 * will not change the value outside of an input event, so you may end up in a situation
 * where the `input` element has a value that does not match the format, such as when
 * initializing a value received from the backend.
 *
 * `format(123456.78, 'en-IN', { format: "currency", currency: "USD" })` → "$1,23,456.78"
 */
export function format(
  value: number | bigint | string,
  { locales, ...options }: NumberFormatOptions & { locales?: Intl.LocalesArgument } = {},
) {
  const localizedValues = _localizeValues(locales);
  const resolvedOptions = _resolveOptions(locales, options);

  return _format(value.toString(), { locales, options, localizedValues, resolvedOptions });
}

/**
 * Unformats the value using the specified locales (see «[Utils](https://github.com/GoncharukOrg/react-input/tree/main/packages/number-format#unformat)»).
 *
 * Returns a string as the numeric equivalent of the formatted value. Essentially does the opposite of the `format` utility.
 *
 * `unformat('$1,23,456.78', 'en-IN')` → "123456.78"
 */
export function unformat(value: string, locales?: Intl.LocalesArgument) {
  const localizedValues = _localizeValues(locales);
  const filteredValue = _filter(value, localizedValues);

  return _normalize(filteredValue, localizedValues).replace(/\.$/, '');
}
