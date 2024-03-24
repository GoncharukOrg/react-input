import type { Replacement } from '../types';

const createError = (ErrorType: ErrorConstructor) => {
  return (...messages: string[]) => {
    return new ErrorType(`${messages.join('\n\n')}\n`);
  };
};

interface Options {
  initialValue: string;
  mask: string;
  replacement: Replacement;
}

/**
 * Выводит в консоль сообщения об ошибках.
 * Сообщения выводятся на этапе инициализации элеменета.
 * @param param
 */
export default function validate({ initialValue, mask, replacement }: Options) {
  if (initialValue.length > mask.length) {
    console.error(
      createError(Error)(
        'The initialized value of the `value` or `defaultValue` property is longer than the value specified in the `mask` property. Check the correctness of the initialized value in the specified property.',
        `Invalid value: "${initialValue}".`,
      ),
    );
  }

  const invalidReplacementKeys = Object.keys(replacement).filter((key) => key.length > 1);

  if (invalidReplacementKeys.length > 0) {
    console.error(
      createError(Error)(
        'Object keys in the `replacement` property are longer than one character. Replacement keys must be one character long. Check the correctness of the value in the specified property.',
        `Invalid keys: ${invalidReplacementKeys.join(', ')}.`,
      ),
    );
  }

  const value = mask.slice(0, initialValue.length);

  let invalidCharIndex = -1;

  for (let i = 0; i < value.length; i++) {
    const isReplacementKey = Object.prototype.hasOwnProperty.call(replacement, value[i]);
    const hasInvalidChar = value[i] !== initialValue[i];

    if (hasInvalidChar && (!isReplacementKey || !replacement[value[i]].test(initialValue[i]))) {
      invalidCharIndex = i;
      break;
    }
  }

  if (invalidCharIndex !== -1) {
    console.error(
      createError(Error)(
        `An invalid character was found in the initialized property value \`value\` or \`defaultValue\` (index: ${invalidCharIndex}). Check the correctness of the initialized value in the specified property.`,
        `Invalid value: "${initialValue}".`,
      ),
    );
  }
}
