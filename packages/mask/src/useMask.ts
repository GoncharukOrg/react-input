import { useRef } from 'react';

import { SyntheticChangeError, useInput } from '@react-input/core';

import filter from './utils/filter';
import formatToReplacementObject from './utils/formatToReplacementObject';
import resolveDetail from './utils/resolveDetail';
import resolveSelection from './utils/resolveSelection';
import unformat from './utils/unformat';
import validate from './utils/validate';

import type { MaskEventDetail, MaskProps, Replacement } from './types';
import type { Init, Tracking } from '@react-input/core';

type CachedMaskProps = Required<Omit<MaskProps, 'track' | 'modify' | 'onMask'>> & {
  replacement: Replacement;
};

interface Cache {
  value: string;
  props: CachedMaskProps;
  fallbackProps: CachedMaskProps;
}

export default function useMask({
  mask = '',
  replacement = {},
  showMask = false,
  separate = false,
  track,
  modify,
  onMask,
}: MaskProps = {}): React.MutableRefObject<HTMLInputElement | null> {
  const replacementObject = typeof replacement === 'string' ? formatToReplacementObject(replacement) : replacement;

  const cache = useRef<Cache | null>(null);

  /**
   *
   * Init
   *
   */

  const init: Init = ({ controlled, initialValue }) => {
    if (process.env.NODE_ENV !== 'production') {
      validate({ initialValue, mask, replacement: replacementObject });
    }

    initialValue = controlled || initialValue ? initialValue : showMask ? mask : '';

    const cachedProps = { mask, replacement: replacementObject, showMask, separate };
    cache.current = { value: initialValue, props: cachedProps, fallbackProps: cachedProps };

    return { value: initialValue };
  };

  /**
   *
   * Tracking
   *
   */

  const tracking: Tracking<MaskEventDetail> = ({ inputType, previousValue, addedValue, changeStart, changeEnd }) => {
    if (cache.current === null) {
      throw new SyntheticChangeError('The state has not been initialized.');
    }

    // Предыдущее значение всегда должно соответствовать маскированному значению из кэша. Обратная ситуация может
    // возникнуть при контроле значения, если значение не было изменено после ввода. Для предотвращения подобных
    // ситуаций, нам важно синхронизировать предыдущее значение с кэшированным значением, если они различаются
    if (cache.current.value !== previousValue) {
      cache.current.props = cache.current.fallbackProps;
    } else {
      cache.current.fallbackProps = cache.current.props;
    }

    // Дополнительно нам важно учесть, что немаскированное значение с учетом удаления или добавления символов должно
    // получаться с помощью закэшированных пропсов, то есть тех которые были применены к значению на момент предыдущего маскирования

    let beforeChangeValue = unformat(previousValue, {
      end: changeStart,
      mask: cache.current.props.mask,
      replacement: cache.current.props.replacement,
      separate: cache.current.props.separate,
    });

    // Регулярное выражение по поиску символов кроме ключей `replacement`
    const regExp$1 = RegExp(`[^${Object.keys(cache.current.props.replacement).join('')}]`, 'g');

    // Находим все заменяемые символы для фильтрации пользовательского значения.
    // Важно определить корректное значение на данном этапе
    const replacementChars = cache.current.props.mask.replace(regExp$1, '');

    if (beforeChangeValue) {
      beforeChangeValue = filter(beforeChangeValue, {
        replacementChars,
        replacement: cache.current.props.replacement,
        separate: cache.current.props.separate,
      });
    }

    const _addedValue = track?.({
      ...(inputType === 'insert' ? { inputType, data: addedValue } : { inputType, data: null }),
      value: previousValue,
      selectionStart: changeStart,
      selectionEnd: changeEnd,
    });

    if (_addedValue === false) {
      throw new SyntheticChangeError('Custom trekking stop.');
    } else if (_addedValue === null) {
      addedValue = '';
    } else if (_addedValue !== true && _addedValue !== undefined) {
      addedValue = _addedValue;
    }

    if (addedValue) {
      addedValue = filter(addedValue, {
        replacementChars: replacementChars.slice(beforeChangeValue.length),
        replacement: cache.current.props.replacement,
        separate: false, // Поскольку нас интересуют только "полезные" символы, фильтруем без учёта заменяемых символов
      });
    }

    if (inputType === 'insert' && addedValue === '') {
      throw new SyntheticChangeError('The character does not match the key value of the `replacement` object.');
    }

    let afterChangeValue = unformat(previousValue, {
      start: changeEnd,
      mask: cache.current.props.mask,
      replacement: cache.current.props.replacement,
      separate: cache.current.props.separate,
    });

    // Модифицируем `afterChangeValue` чтобы позиция символов не смещалась. Необходимо выполнять
    // после фильтрации `addedValue` и перед фильтрацией `afterChangeValue`
    if (cache.current.props.separate) {
      // Находим заменяемые символы в диапазоне изменяемых символов
      const separateChars = cache.current.props.mask.slice(changeStart, changeEnd).replace(regExp$1, '');

      // Получаем количество символов для сохранения перед `afterChangeValue`. Возможные значения:
      // `меньше ноля` - обрезаем значение от начала на количество символов;
      // `ноль` - не меняем значение;
      // `больше ноля` - добавляем заменяемые символы к началу значения.
      const countSeparateChars = separateChars.length - addedValue.length;

      if (countSeparateChars < 0) {
        afterChangeValue = afterChangeValue.slice(-countSeparateChars);
      } else if (countSeparateChars > 0) {
        afterChangeValue = separateChars.slice(-countSeparateChars) + afterChangeValue;
      }
    }

    if (afterChangeValue) {
      afterChangeValue = filter(afterChangeValue, {
        replacementChars: replacementChars.slice(beforeChangeValue.length + addedValue.length),
        replacement: cache.current.props.replacement,
        separate: cache.current.props.separate,
      });
    }

    const input = beforeChangeValue + addedValue + afterChangeValue;

    /* eslint-disable prefer-const */
    let {
      mask: modifiedMask = mask,
      replacement: modifiedReplacement = replacementObject,
      showMask: modifiedShowMask = showMask,
      separate: modifiedSeparate = separate,
    } = modify?.(input) ?? {};

    if (typeof modifiedReplacement === 'string') {
      modifiedReplacement = formatToReplacementObject(modifiedReplacement);
    }

    const detail = resolveDetail(input, {
      mask: modifiedMask,
      replacement: modifiedReplacement,
      showMask: modifiedShowMask,
    });

    const selection = resolveSelection({
      inputType,
      value: detail.value,
      addedValue,
      beforeChangeValue,
      // afterChangeValue,
      parts: detail.parts,
      replacement: modifiedReplacement,
      separate: modifiedSeparate,
    });

    cache.current.value = detail.value;
    cache.current.props = {
      mask: modifiedMask,
      replacement: modifiedReplacement,
      showMask: modifiedShowMask,
      separate: modifiedSeparate,
    };

    return {
      value: detail.value,
      selectionStart: selection,
      selectionEnd: selection,
      __detail: detail,
    };
  };

  /**
   *
   * Use input
   *
   */

  return useInput<MaskEventDetail>({
    init,
    tracking,
    eventType: 'input-mask',
    eventHandler: onMask,
  });
}
