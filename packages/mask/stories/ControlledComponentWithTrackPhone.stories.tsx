import { useState } from 'react';

import { InputMask } from '../src';

import type { MaskEventDetail, Track } from '../src';
import type { Meta, StoryObj } from '@storybook/react';

export default {
  title: 'Mask',
  component: InputMask,
} satisfies Meta<typeof InputMask>;

function Component() {
  const [detail, setDetail] = useState<MaskEventDetail | null>(null);

  const track: Track = ({ inputType, value, data, selectionStart, selectionEnd }) => {
    if (inputType === 'insert' && selectionStart <= 1) {
      const _data = data.replace(/\D/g, '');
      return /^[78]/.test(_data) ? `7${_data.slice(1)}` : /^[0-69]/.test(_data) ? `7${_data}` : data;
    }

    if (inputType !== 'insert' && selectionStart <= 1 && selectionEnd < value.length) {
      return selectionEnd > 2 ? '7' : selectionEnd === 2 ? false : data;
    }

    return data;
  };

  return (
    <>
      <InputMask
        mask="+_ (___) ___-__-__"
        replacement={{ _: /\d/ }}
        track={track}
        value={detail?.value}
        onMask={(event) => {
          setDetail(event.detail);
        }}
      />

      <pre>{JSON.stringify(detail, null, 2)}</pre>
    </>
  );
}

export const ControlledComponentWithTrackPhone = {
  render: Component,
} satisfies StoryObj<typeof InputMask>;
