import type { MaskEventDetail, MaskPart, Replacement } from '../types';

/**
 * Формирует регулярное выражение для паттерна в `input`
 * @param mask
 * @param replacement
 * @param disableReplacementKey если `true`, поиск по регулярному выражению не будет учитывать
 * ключ параметра `replacement`, то есть символ по индексу символа замены в значении может быть
 * любым символом соответствующим значению `replacement` кроме ключа самого `replacement`.
 *
 * Так, если `mask === 'abc_123'` и `replacement === { _: /\D/ }` то
 * - при `false`: `pattern === /^abc\D123$/` и `pattern.test('abc_123')` вернёт `true`;
 * - при `true`: `pattern === /^abc(?!_)\D123$/` и `pattern.test('abc_123')` вернёт `false`.
 * @returns
 */
function generatePattern(mask: string, replacement: Replacement, disableReplacementKey: boolean): string {
  const special = ['[', ']', '\\', '/', '^', '$', '.', '|', '?', '*', '+', '(', ')', '{', '}'];

  let pattern = '';

  for (let i = 0; i < mask.length; i++) {
    const isReplacementKey = Object.prototype.hasOwnProperty.call(replacement, mask[i]);
    const lookahead = disableReplacementKey ? `(?!${mask[i]})` : '';

    if (i === 0) {
      pattern += '^';
    }

    pattern += isReplacementKey
      ? lookahead + replacement[mask[i]].toString().slice(1, -1)
      : special.includes(mask[i])
        ? `\\${mask[i]}`
        : mask[i];

    if (i === mask.length - 1) {
      pattern += '$';
    }
  }

  return pattern;
}

interface Options {
  mask: string;
  replacement: Replacement;
}

/**
 * Определяет части маскированного значения. Части маскированного значения представляет собой массив
 * объектов, где каждый объект содержит в себе всю необходимую информацию о каждом символе значения.
 * Части маскированного значения используется для точечного манипулирования символом или группой символов.
 * @param value
 * @param options
 * @returns
 */
function formatToParts(value: string, { mask, replacement }: Options): MaskPart[] {
  return value.split('').map((char, index) => {
    const isReplacementKey = Object.prototype.hasOwnProperty.call(replacement, char);

    const type = isReplacementKey
      ? ('replacement' as const) // символ замены
      : char === mask[index]
        ? ('mask' as const) // символ маски
        : ('input' as const); // символ введенный пользователем

    return { type, value: char, index };
  });
}

/**
 * Маскирует значение по заданной маске
 * @param input
 * @param options
 * @returns
 */
function formatToMask(input: string, { mask, replacement }: Options): string {
  let position = 0;
  let formattedValue = '';

  for (const char of mask) {
    const isReplacementKey = Object.prototype.hasOwnProperty.call(replacement, char);

    if (isReplacementKey && input[position] !== undefined) {
      formattedValue += input[position++];
    } else {
      formattedValue += char;
    }
  }

  return formattedValue;
}

interface FormatOptions {
  mask: string;
  replacement: Replacement;
  showMask: boolean;
}

/**
 * Формирует данные маскированного значения
 * @param input пользовательские символы без учета символов маски
 * @param param
 * @param param.mask
 * @param param.replacement
 * @param param.showMask
 * @returns объект с данными маскированного значение
 */
export default function resolveDetail(input: string, { mask, replacement, showMask }: FormatOptions): MaskEventDetail {
  let formattedValue = formatToMask(input, { mask, replacement });

  const parts = formatToParts(formattedValue, { mask, replacement });

  // Обрезаем значение по последний пользовательский символ,
  // если символ не найден, получится пустая строка
  if (!showMask) {
    let lastChangedCharIndex = -1;

    for (let i = parts.length - 1; i >= 0; i--) {
      if (parts[i].type === 'input') {
        lastChangedCharIndex = parts[i].index;
        break;
      }
    }

    formattedValue = formattedValue.slice(0, lastChangedCharIndex + 1);
  }

  const pattern = generatePattern(mask, replacement, false);
  const patternWithDisableReplacementKey = generatePattern(mask, replacement, true);

  const isValid = RegExp(patternWithDisableReplacementKey).test(formattedValue);

  return { value: formattedValue, input, parts, pattern, isValid };
}
