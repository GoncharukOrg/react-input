import type { LocalizedNumberFormatValues, ResolvedNumberFormatOptions } from '../types';
import type { InputType } from '@react-input/core';

interface ResolveSelectionParam {
  localizedValues: LocalizedNumberFormatValues;
  previousLocalizedValues: LocalizedNumberFormatValues;
  resolvedOptions: ResolvedNumberFormatOptions;
  inputType: InputType;
  value: string;
  addedValue: string;
  previousValue: string;
  changeStart: number;
  changeEnd: number;
}

interface ResolveSelectionReturn {
  start: number;
  end: number;
}

/**
 * Определяет позицию каретки для последующей установки
 * @param param
 * @returns
 */
export default function resolveSelection({
  localizedValues,
  previousLocalizedValues,
  resolvedOptions,
  inputType,
  value,
  previousValue,
  addedValue,
  changeStart,
  changeEnd,
}: ResolveSelectionParam): ResolveSelectionReturn {
  const hasPreviousDecimal = previousValue.includes(localizedValues.decimal);

  // Если был введен `decimal` возвращаем позицию после символа `decimal`
  if (hasPreviousDecimal && RegExp(`^[.,${localizedValues.decimal}]$`).test(addedValue)) {
    const decimalIndex = value.indexOf(localizedValues.decimal);

    if (decimalIndex !== -1) {
      const position = decimalIndex + 1;
      return { start: position, end: position };
    }
  }

  const hasPreviousMinusSign = previousValue.includes(localizedValues.minusSign);

  // Если был введен `minusSign`
  if (hasPreviousMinusSign && RegExp(`^[\\-\\${localizedValues.minusSign}]$`).test(addedValue)) {
    const minusSignIndex = value.indexOf(localizedValues.minusSign);

    if (minusSignIndex !== -1) {
      const position = minusSignIndex + (localizedValues.signBackwards ? 0 : 1);
      return { start: position, end: position };
    }
  }

  // При стирании значения в `integer`, при условии что `integer` равен нулю,
  // необходимо выделить все нули для последующего удаления `integer`. Такое
  // поведение оправдано в случае если `minimumIntegerDigits` больше чем 1
  if (inputType === 'deleteBackward' || inputType === 'deleteForward') {
    const [beforePreviousDecimal] = previousValue.split(previousLocalizedValues.decimal);

    if (
      changeEnd <= beforePreviousDecimal.length &&
      !RegExp(`[${previousLocalizedValues.digits.slice(1)}]`).test(beforePreviousDecimal)
    ) {
      const firstPreviousIntegerDigitIndex = beforePreviousDecimal.indexOf(previousLocalizedValues.digits[0]);
      const lastPreviousIntegerDigitIndex = beforePreviousDecimal.lastIndexOf(previousLocalizedValues.digits[0]);

      if (firstPreviousIntegerDigitIndex !== -1 && lastPreviousIntegerDigitIndex !== -1) {
        const _lastPreviousIntegerDigitIndex = lastPreviousIntegerDigitIndex + 1;

        // Нам не нужно повторно сохранять выделение
        const hasNotSelection =
          changeStart !== firstPreviousIntegerDigitIndex || changeEnd !== _lastPreviousIntegerDigitIndex;

        const hasIntegerDigitsRange =
          changeEnd > firstPreviousIntegerDigitIndex && changeEnd <= _lastPreviousIntegerDigitIndex;

        if (hasNotSelection && hasIntegerDigitsRange) {
          return { start: firstPreviousIntegerDigitIndex, end: _lastPreviousIntegerDigitIndex };
        }
      }
    }
  }

  // Поскольку длина значения способна меняться, за счёт добавления/удаления
  // символов разрядности, гарантированным способом получить точную позицию
  // каретки, в рамках изменения значения при добавлении/удалении значения,
  // будет подсчёт количества цифр до выделенной области изменения (до `changeStart`).

  const maximumIntegerDigits =
    resolvedOptions.maximumIntegerDigits !== undefined ? Number(resolvedOptions.maximumIntegerDigits) : undefined;

  let selection = value.length;
  // "Устойчиваое" число - цифры и десятичный разделитель без учитёта
  // нулей от начала значения до первой цифры не равной нулю в `integer`
  let countStableDigits = 0;

  // Находим символы "устойчивого" числа до `changeStart`
  for (let i = 0, start = false; i < changeStart; i++) {
    const isDigit = previousLocalizedValues.digits.includes(previousValue[i]);
    const isDecimal = previousValue[i] === previousLocalizedValues.decimal;

    if (!start && (isDecimal || (isDigit && previousValue[i] !== previousLocalizedValues.digits[0]))) {
      start = true;
    }

    if (start && (isDecimal || isDigit)) {
      countStableDigits += 1;
    }
  }

  // Важно учесть добавленные символы, в противном случае позиция каретки не будет сдвигаться
  if (inputType === 'insert') {
    const previousValueBeforeSelectionStartRange = previousValue.slice(0, changeStart);
    const previousDecimalIndex = previousValue.indexOf(previousLocalizedValues.decimal);

    // eslint-disable-next-line prefer-const
    let [previousInteger, previousFraction = ''] = previousValueBeforeSelectionStartRange
      .replace(RegExp(`[^${previousLocalizedValues.decimal}${previousLocalizedValues.digits}]`, 'g'), '')
      .replace(RegExp(`^${previousLocalizedValues.digits[0]}+`, 'g'), '')
      .split(previousLocalizedValues.decimal);

    let absAdded = addedValue
      .replace(RegExp(`[\\-\\${localizedValues.minusSign}]`, 'g'), '')
      .replace(RegExp(`[,${localizedValues.decimal}]`, 'g'), '.');

    // Поскольку десятичный разделитель не может находиться
    // перед имеющимся разделителем, нам важно удалить его
    if (previousDecimalIndex !== -1 && changeEnd <= previousDecimalIndex) {
      absAdded = absAdded.replace(RegExp(`[^\\d${localizedValues.digits}]+`, 'g'), '');
    }

    const hasAddedDecimal = absAdded.includes('.');
    let [addedInteger, addedFraction = ''] = absAdded.split('.');

    if (previousDecimalIndex !== -1 && changeStart > previousDecimalIndex) {
      if (hasAddedDecimal) {
        // Нам важно не учитывать `decimal` в предыдущем значении поскольку
        // в текущем значении при данном условии он будет отсутствовать
        countStableDigits -= 1;

        const joinedPreviousInteger = previousInteger + previousFraction;

        if (maximumIntegerDigits !== undefined && joinedPreviousInteger.length > maximumIntegerDigits) {
          countStableDigits = maximumIntegerDigits;
          previousInteger = joinedPreviousInteger.slice(0, maximumIntegerDigits);
        }
      } else {
        addedFraction = addedInteger;
        addedInteger = '';
      }
    }

    const p$1 = `[${previousLocalizedValues.decimal}${previousLocalizedValues.digits.slice(1)}]`;

    if (!RegExp(p$1).test(previousValueBeforeSelectionStartRange)) {
      addedInteger = addedInteger.replace(RegExp(`^[0${previousLocalizedValues.digits[0]}]+`, 'g'), '');
    }

    const endSlice = maximumIntegerDigits !== undefined ? maximumIntegerDigits - previousInteger.length : undefined;
    const normalizedAdded = addedInteger.slice(0, endSlice) + (hasAddedDecimal ? '.' : '') + addedFraction;

    countStableDigits += normalizedAdded.replace(
      RegExp(`[^\\.${localizedValues.decimal}\\d${localizedValues.digits}]+`, 'g'),
      '',
    ).length;
  }

  // Вычисляем первоначальную позицию каретки по индексу отформатированного
  // значения путём подсчёта количества цифр "устойчивого" числа, где:
  // `start` - начало "устойчивого" числа
  // `countDigits` - количество найденных символов после начала "устойчивого" числа
  // Порядок инструкций имеет значение!
  for (let i = 0, start = false, countDigits = 0; i < value.length; i++) {
    const isDigit = localizedValues.digits.includes(value[i]);
    const isDecimal = value[i] === localizedValues.decimal;

    if (!start && (isDecimal || (isDigit && value[i] !== localizedValues.digits[0]))) {
      start = true;
    }

    if (start && countDigits >= countStableDigits) {
      selection = i;
      break;
    }

    if (start && (isDecimal || isDigit)) {
      countDigits += 1;
    }
  }

  // Сдвигаем каретку к ближайшей цифре
  if (inputType === 'deleteForward') {
    const p$1 = `\\${localizedValues.minusSign}`;
    const p$2 = `^.{${selection}}[^${localizedValues.decimal}${localizedValues.digits}]*[${p$1}${localizedValues.decimal}${localizedValues.digits}]`;
    const nextDigitIndex = RegExp(p$2).exec(value)?.[0].length;

    if (nextDigitIndex !== undefined) {
      selection = nextDigitIndex - 1;
    }
  } else {
    // При `deleteBackward` нам важно поставить каретку после знака минуса, если такой существует
    const p$1 = inputType === 'deleteBackward' ? `\\${localizedValues.minusSign}` : '';
    const p$2 = `[${p$1}${localizedValues.decimal}${localizedValues.digits}][^${localizedValues.decimal}${localizedValues.digits}]*.{${value.length - selection}}$`;
    const previousDigitIndex = RegExp(p$2).exec(value)?.index;

    if (previousDigitIndex !== undefined) {
      selection = previousDigitIndex + 1;
    }

    if (
      value[selection] === localizedValues.decimal &&
      RegExp(`[.,${localizedValues.decimal}]`).test(addedValue[addedValue.length - 1] ?? '')
    ) {
      selection += 1;
    }
  }

  // Страхуем границы позиции каретки
  {
    const p$1 = `[\\${localizedValues.minusSign}${localizedValues.decimal}${localizedValues.digits.slice(1)}]`;
    const p$2 = `[\\${localizedValues.minusSign}${localizedValues.decimal}${localizedValues.digits}][^${localizedValues.decimal}${localizedValues.digits}]*$`;

    const firstIndex = value.search(RegExp(p$1));
    const lastIndex = value.search(RegExp(p$2));

    if (firstIndex !== -1 && selection < firstIndex) {
      selection = firstIndex;
    } else if (lastIndex !== -1 && selection > lastIndex + 1) {
      selection = lastIndex + 1;
    }
  }

  return { start: selection, end: selection };
}
