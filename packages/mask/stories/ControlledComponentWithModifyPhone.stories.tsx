import React, { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { InputMask, type MaskEventDetail } from '../src';

export default {
  title: 'Mask',
  component: InputMask,
} satisfies Meta<typeof InputMask>;

function StoryControlledComponentWithModifyPhone() {
  const [detail, setDetail] = useState<MaskEventDetail | null>(null);

  const modify = (input: string) => {
    const newMask = input && input[0] !== '7' ? '+_ __________' : '+_ (___) ___-__-__';
    return { mask: newMask };
  };

  return (
    <>
      <InputMask
        mask="+_ (___) ___-__-__"
        replacement={{ _: /\d/ }}
        value={detail?.value}
        modify={modify}
        onMask={(event) => setDetail(event.detail)}
      />

      <pre>{JSON.stringify(detail, null, 2)}</pre>
    </>
  );
}

export const ControlledComponentWithModifyPhone = {
  render: StoryControlledComponentWithModifyPhone,
} satisfies StoryObj<typeof InputMask>;
