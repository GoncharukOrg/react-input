/**
 * One input for both login and phone number.
 *
 * Login can consist of underscores and Latin letters.
 *
 * If the phone number input starts with "8", "8" -> "7" is replaced, otherwise,
 * if the input starts with a digit not equal to "7" or "8", "7" is substituted at the beginning of the value.
 *
 * If there is at least one user character not equal to a digit, the input mask is changed.
 */

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import React, { useState } from 'react';

import { InputMask, format } from '@react-input/mask';

import type { Modify, Track } from '@react-input/mask';

const phoneOptions = {
  mask: '+# (###) ###-##-##',
  replacement: { '#': /\d/ },
};

const loginOptions = {
  mask: '#'.repeat(30),
  replacement: { '#': /[\da-zA-Z_]/ },
};

const track: Track = ({ inputType, value, data, selectionStart, selectionEnd }) => {
  let _value = value.slice(0, selectionStart) + (data ?? '') + value.slice(selectionEnd);
  _value = _value.replace(/[\s()+-]/g, '');

  const isPhoneNumber = _value === '' || /^\d+$/.test(_value);

  if (isPhoneNumber && inputType === 'insert' && selectionStart <= 1) {
    const _data = data.replace(/[^\d]/g, '');
    return /^[78]/.test(_data) ? `7${_data.slice(1)}` : /^[0-69]/.test(_data) ? `7${_data}` : data;
  }

  if (isPhoneNumber && inputType !== 'insert' && selectionStart <= 1 && selectionEnd < value.length) {
    return selectionEnd > 2 ? '7' : selectionEnd === 2 && value.startsWith('+') ? false : data;
  }

  return data;
};

const modify: Modify = ({ value, data, selectionStart, selectionEnd }) => {
  const _value = value.slice(0, selectionStart) + (data ?? '') + value.slice(selectionEnd);
  const isPhone = /^\d+$/.test(_value.replace(/[^\da-zA-Z_]/g, ''));

  return isPhone ? phoneOptions : loginOptions;
};

export default function Component() {
  const [value, setValue] = useState('');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value;

    if (value.startsWith('+8')) {
      value = `+7${value.slice(2)}`;
    } else if (/^\+[^7]/.test(value)) {
      value = format(`7${value.replace(/\D/g, '')}`, phoneOptions);
    }

    if (value.startsWith('+') && (event.target.selectionStart ?? 0) < 2) {
      requestAnimationFrame(() => {
        event.target.setSelectionRange(2, 2);
      });
    }

    setValue(value);
  };

  return <InputMask {...phoneOptions} modify={modify} track={track} value={value} onChange={handleChange} />;
}
