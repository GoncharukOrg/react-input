import filter from './utils/filter';
import _format from './utils/format';
import _formatToParts from './utils/formatToParts';
import formatToReplacementObject from './utils/formatToReplacementObject';
import _unformat from './utils/unformat';

import type { MaskPart, Replacement } from './types';

interface Options {
  mask: string;
  replacement: string | Replacement;
}

/**
 * Masks a value using the specified mask (see «[Utils](https://github.com/GoncharukBro/react-input/tree/main/packages/mask#format)»).
 *
 * The result fully corresponds to the value obtained when entering.
 * Useful when you need to get a masked value without calling an input event.
 *
 * Since the principle of operation of `InputMask` is fully consistent with the operation
 * of the `input` element, `InputMask` will not change the value outside the input event, so
 * you may find yourself in a situation where the `input` element will have a value that does not
 * correspond to the mask, for example when initializing the value of the received from the backend.
 *
 * `format('1', { mask: '+__', replacement: { _: /\d/ } })` → "+1"
 */
export function format(value: string, { mask, replacement }: Options): string {
  const replacementObject = typeof replacement === 'string' ? formatToReplacementObject(replacement) : replacement;

  const regExp$1 = RegExp(`[^${Object.keys(replacementObject).join('')}]`, 'g');
  const replacementChars = mask.replace(regExp$1, '');

  const input = filter(value, { replacementChars, replacement: replacementObject, separate: false });

  return _format(input, { mask, replacement: replacementObject, showMask: false });
}

/**
 * Unmasks the value using the specified mask (see «[Utils](https://github.com/GoncharukBro/react-input/tree/main/packages/mask#unformat)»).
 *
 * Returns all characters entered by the user. Essentially does the opposite of the `format` utility.
 *
 * `unformat('+1_', { mask: '+__', replacement: { _: /\d/ } })` → "1"
 */
export function unformat(formattedValue: string, { mask, replacement }: Options): string {
  const replacementObject = typeof replacement === 'string' ? formatToReplacementObject(replacement) : replacement;

  const value = _unformat(formattedValue, { mask, replacement: replacementObject, separate: false });

  const regExp$1 = RegExp(`[^${Object.keys(replacementObject).join('')}]`, 'g');
  const replacementChars = mask.replace(regExp$1, '');

  return filter(value, { replacementChars, replacement: replacementObject, separate: false });
}

/**
 * Specifies the parts of the masked value (see «[Utils](https://github.com/GoncharukBro/react-input/tree/main/packages/mask#formattoparts)»).
 *
 * The masked value parts are an array of objects, where each object contains the
 * necessary information about each character of the value. Parts of the masked value
 * are used to manipulate a character or group of characters in a point-by-point manner.
 *
 * Parts of the masked value, where each object contains the character type:
 * - `replacement` - the replacement character;
 * - `mask` - the mask character;
 * - `input` - the character entered by the user.
 *
 * `formatToParts('1', { mask: '+__', replacement: { _: /\d/ } })` →
 * ```
 * [
 *   { index: 0, value: '+', type: 'mask' },
 *   { index: 1, value: '1', type: 'input' },
 *   { index: 2, value: '_', type: 'replacement' },
 * ]
 * ```
 */
export function formatToParts(value: string, { mask, replacement }: Options): MaskPart[] {
  const replacementObject = typeof replacement === 'string' ? formatToReplacementObject(replacement) : replacement;

  const formattedValue = format(value, { mask, replacement: replacementObject });

  return _formatToParts(formattedValue, { mask, replacement: replacementObject });
}

/**
 * Generates a regular expression to match a masked value (see «[Utils](https://github.com/GoncharukBro/react-input/tree/main/packages/mask#generatepattern)»).
 *
 * If `takeReplacementKey: true`, then the regular expression search will not take into account the
 * `replacement` parameter key, that is, the character at the index of the replacement character in the
 * value can be any character corresponding to the `replacement` value except the `replacement` key itself.
 *
 * So, if `mask: '_'` and `replacement: { _: /\D/ }` then:
 * - if `takeReplacementKey: false`, the regular expression (pattern) will match `/^\D$/` and `RegExp(pattern).test(mask)` will return `true`;
 * - if `takeReplacementKey: true`, the regular expression (pattern) will match `/^(?!_)\D$/` and `RegExp(pattern).test(mask)` will return `false`,
 * but any a valid character, in addition to the replacement character, will contribute to the return of `true`.
 */
export function generatePattern({ mask, replacement }: Options, takeReplacementKey = false): string {
  const replacementObject = typeof replacement === 'string' ? formatToReplacementObject(replacement) : replacement;

  const special = ['[', ']', '\\', '/', '^', '$', '.', '|', '?', '*', '+', '(', ')', '{', '}'];

  let pattern = '';

  for (let i = 0; i < mask.length; i++) {
    const isReplacementKey = Object.prototype.hasOwnProperty.call(replacementObject, mask[i]);
    const lookahead = takeReplacementKey ? `(?!${mask[i]})` : '';

    if (i === 0) {
      pattern += '^';
    }

    pattern += isReplacementKey
      ? lookahead + replacementObject[mask[i]].toString().slice(1, -1)
      : special.includes(mask[i])
        ? `\\${mask[i]}`
        : mask[i];

    if (i === mask.length - 1) {
      pattern += '$';
    }
  }

  return pattern;
}
