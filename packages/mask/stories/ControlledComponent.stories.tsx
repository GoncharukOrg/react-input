import React, { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { InputMask } from '../src';

export default {
  title: 'Mask',
  component: InputMask,
} satisfies Meta<typeof InputMask>;

function Component() {
  const [value, setValue] = useState('');

  return (
    <>
      <InputMask
        mask="+7 (___) ___-__-__"
        replacement={{ _: /\d/ }}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />

      <pre>{JSON.stringify({ value }, null, 2)}</pre>
    </>
  );
}

export const ControlledComponent = {
  render: Component,
} satisfies StoryObj<typeof InputMask>;
