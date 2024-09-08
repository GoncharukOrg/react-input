import { useState } from 'react';

import { InputMask } from '../src';

import type { Meta, StoryObj } from '@storybook/react';

export default {
  title: 'Mask',
  component: InputMask,
} satisfies Meta<typeof InputMask>;

function Component() {
  const [value, setValue] = useState('');

  return (
    <InputMask
      mask="+7 (___) ___-__-__"
      replacement={{ _: /\d/ }}
      value={value}
      onChange={(event) => {
        setValue(event.target.value);
      }}
    />
  );
}

export const ControlledComponent = {
  render: Component,
} satisfies StoryObj<typeof InputMask>;
