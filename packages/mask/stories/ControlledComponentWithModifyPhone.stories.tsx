import { useState } from 'react';

import { InputMask } from '../src';

import type { Meta, StoryObj } from '@storybook/react';

export default {
  title: 'Mask',
  component: InputMask,
} satisfies Meta<typeof InputMask>;

function Component() {
  const [value, setValue] = useState('');

  const modify = (input: string) => {
    const newMask = input && !input.startsWith('7') ? '+_ __________' : '+_ (___) ___-__-__';
    return { mask: newMask };
  };

  return (
    <InputMask
      mask="+_ (___) ___-__-__"
      modify={modify}
      replacement={{ _: /\d/ }}
      value={value}
      onChange={(event) => {
        setValue(event.target.value);
      }}
    />
  );
}

export const ControlledComponentWithModifyPhone = {
  render: Component,
} satisfies StoryObj<typeof InputMask>;
