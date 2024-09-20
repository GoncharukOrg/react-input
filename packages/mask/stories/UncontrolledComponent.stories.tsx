import React, { useState } from 'react';

import { InputMask } from '../src';

import type { MaskEventDetail } from '../src';
import type { Meta, StoryObj } from '@storybook/react';

export default {
  title: 'Mask',
  component: InputMask,
} satisfies Meta<typeof InputMask>;

function Component() {
  const [detail, setDetail] = useState<MaskEventDetail | null>(null);

  return (
    <>
      <InputMask
        autoFocus
        defaultValue="+7 (___) ___-__-__"
        mask="+7 (___) ___-__-__"
        replacement={{ _: /\d/ }}
        onMask={(event) => {
          setDetail(event.detail);
        }}
      />

      <pre>{JSON.stringify(detail, null, 2)}</pre>
    </>
  );
}

export const UncontrolledComponent = {
  render: Component,
} satisfies StoryObj<typeof InputMask>;
