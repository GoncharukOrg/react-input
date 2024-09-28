import _localizeValues from './utils/localizeValues';
import _unformat from './utils/unformat';

/**
 * Unformats the value using the specified locales (see «[Utils](https://github.com/GoncharukOrg/react-input/tree/main/packages/number-format#unformat)»).
 *
 * `unformat('$1,23,456.78', 'en-IN')` → 123456.78
 */
export function unformat(formattedValue: string, locales?: Intl.LocalesArgument): number {
  const localizedValues = _localizeValues(locales);
  const value = _unformat(formattedValue, localizedValues);

  return Number(value);
}
