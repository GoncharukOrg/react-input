/**
 * Input for entering a phone number.
 *
 * If the input of a phone number starts with "8", the replacement "8" -> "7" occurs, otherwise,
 * if the input starts with a digit not equal to "7" or "8", then "7" is substituted at the beginning of the value.
 */

import React from 'react';

import { InputMask } from '@react-input/mask';

import type { Track } from '@react-input/mask';

const track: Track = ({ inputType, value, data, selectionStart, selectionEnd }) => {
  if (inputType === 'insert' && selectionStart <= 1) {
    const _data = data.replace(/[^\d]/g, '');
    return /^[78]/.test(_data) ? `7${_data.slice(1)}` : /^[0-69]/.test(_data) ? `7${_data}` : data;
  }

  if (inputType !== 'insert' && selectionStart <= 1 && selectionEnd < value.length) {
    return selectionEnd > 2 ? '7' : selectionEnd === 2 ? false : data;
  }

  return data;
};

export default function Component() {
  return <InputMask inputMode="numeric" mask="+# (###) ###-##-##" replacement={{ '#': /\d/ }} track={track} />;
}
