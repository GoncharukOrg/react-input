import _filter from './utils/filter';
import _format from './utils/format';
import _formatToParts from './utils/formatToParts';
import _formatToReplacementObject from './utils/formatToReplacementObject';
import _unformat from './utils/unformat';

import type { MaskPart, Overlap, Replacement } from './types';

interface Options {
  mask: string;
  replacement: string | Replacement;
}

/**
 * Masks a value using the specified mask (see «[Utils](https://github.com/GoncharukOrg/react-input/tree/main/packages/mask#format)»).
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
  const replacementObject = typeof replacement === 'string' ? _formatToReplacementObject(replacement) : replacement;

  const regExp$1 = RegExp(`[^${Object.keys(replacementObject).join('')}]`, 'g');
  const replacementChars = mask.replace(regExp$1, '');

  const input = _filter(value, { replacementChars, replacement: replacementObject, separate: false });

  return _format(input, { mask, replacement: replacementObject, separate: false, showMask: false });
}

/**
 * Unmasks the value using the specified mask (see «[Utils](https://github.com/GoncharukOrg/react-input/tree/main/packages/mask#unformat)»).
 *
 * Returns all characters entered by the user. Essentially does the opposite of the `format` utility.
 *
 * `unformat('+1_', { mask: '+__', replacement: { _: /\d/ } })` → "1"
 */
export function unformat(value: string, { mask, replacement }: Options): string {
  const replacementObject = typeof replacement === 'string' ? _formatToReplacementObject(replacement) : replacement;

  const unformattedValue = _unformat(value, { mask, replacement: replacementObject, separate: false });

  const regExp$1 = RegExp(`[^${Object.keys(replacementObject).join('')}]`, 'g');
  const replacementChars = mask.replace(regExp$1, '');

  return _filter(unformattedValue, { replacementChars, replacement: replacementObject, separate: false });
}

/**
 * Specifies the parts of the masked value (see «[Utils](https://github.com/GoncharukOrg/react-input/tree/main/packages/mask#formattoparts)»).
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
  const replacementObject = typeof replacement === 'string' ? _formatToReplacementObject(replacement) : replacement;

  const formattedValue = format(value, { mask, replacement: replacementObject });

  return _formatToParts(formattedValue, { mask, replacement: replacementObject });
}

const SPECIAL = ['[', ']', '\\', '/', '^', '$', '.', '|', '?', '*', '+', '(', ')', '{', '}'];

function resolveSpecial(char: string) {
  return SPECIAL.includes(char) ? `\\${char}` : char;
}

/**
 * Generates a regular expression to match a masked value (see «[Utils](https://github.com/GoncharukOrg/react-input/tree/main/packages/mask#generatepattern)»).
 *
 * If the first parameter is `full`, then the regular expression will match the entire length of the mask. Otherwise, if `partial` is specified as the first
 * parameter, then the regular value can also match a partial value.
 *
 * Additionally, it is possible to generate an inexact match. So if the first parameter has the `-inexact` postfix, then the regular expression search will
 * not take into account the `replacement` parameter key, i.e. the character in the index of the replacement character in the value can be any character that
 * matches the `replacement` value, except for the `replacement` key itself.
 *
 * So, if `mask: '###'` and `replacement: { '#': /\D/ }`, then:
 * - if `overlap: 'full'`, the regular expression (pattern) will match all non-digits except "#" and `RegExp(pattern).test('ab#')` will return `false`;
 * - if `overlap: 'full-inexact'`, the regular expression (pattern) will match all non-digits including "#" and `RegExp(pattern).test('ab#')` will return `true`;
 * - if `overlap: 'partial'`, the regular expression (pattern) will match all non-digits except "#" taking into account the partial value and `RegExp(pattern).test('a#')` will return `false`;
 * - if `overlap: 'partial-inexact'`, the regular expression (pattern) will match all non-digits including "#" taking into account the partial value and `RegExp(pattern).test('a#')` will return `true`.
 */
export function generatePattern(overlap: Overlap, { mask, replacement }: Options): string {
  if (overlap !== 'full' && overlap !== 'full-inexact' && overlap !== 'partial' && overlap !== 'partial-inexact') {
    new TypeError('The overlap value can be "full", "full-inexact", "partial" or "partial-inexact".');
  }

  const replacementObject = typeof replacement === 'string' ? _formatToReplacementObject(replacement) : replacement;
  const isPartial = overlap === 'partial' || overlap === 'partial-inexact';
  const isExact = overlap === 'full' || overlap === 'partial';

  let pattern = '';

  for (let i = 0; i < mask.length; i++) {
    const char = mask[i];
    const isReplacementKey = Object.prototype.hasOwnProperty.call(replacementObject, char);

    if (i === 0) {
      pattern = '^';
    }

    if (isPartial) {
      pattern += '(';
    }

    pattern += isReplacementKey
      ? `${isExact ? `(?!${resolveSpecial(char)})` : ''}(${replacementObject[char].source})`
      : resolveSpecial(char);

    if (i === mask.length - 1) {
      if (isPartial) {
        pattern += ')?'.repeat(mask.length);
      }

      pattern += '$';
    }
  }

  return pattern;
}
