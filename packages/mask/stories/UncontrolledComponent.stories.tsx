import React, { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { InputMask, type MaskEventDetail } from '../src';

export default {
  title: 'Mask',
  component: InputMask,
} satisfies Meta<typeof InputMask>;

function StoryUncontrolledComponent() {
  const [detail, setDetail] = useState<MaskEventDetail | null>(null);

  return (
    <>
      <InputMask
        mask="+7 (___) ___-__-__"
        replacement={{ _: /\d/ }}
        defaultValue="+7 (___) ___-__-__"
        autoFocus
        onMask={(event) => setDetail(event.detail)}
      />

      <pre>{JSON.stringify(detail, null, 2)}</pre>
    </>
  );
}

export const UncontrolledComponent = {
  render: StoryUncontrolledComponent,
} satisfies StoryObj<typeof InputMask>;
