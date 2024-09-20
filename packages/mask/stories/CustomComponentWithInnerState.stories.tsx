// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import React, { forwardRef, useState } from 'react';

import { InputMask } from '../src';

import type { Meta, StoryObj } from '@storybook/react';

export default {
  title: 'Mask',
  component: InputMask,
} satisfies Meta<typeof InputMask>;

interface ForwardedCustomComponentProps {
  label?: string;
}

function ForwardedCustomComponent(
  { label }: ForwardedCustomComponentProps,
  forwardedRef: React.ForwardedRef<HTMLInputElement>,
) {
  const [value, setValue] = useState('');

  return (
    <>
      <label htmlFor="custom-input">{label}</label>
      <input
        ref={forwardedRef}
        id="custom-input"
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
        }}
      />
    </>
  );
}

const CustomComponent = forwardRef(ForwardedCustomComponent);

function Component() {
  return (
    <InputMask component={CustomComponent} label="Мой заголовок" mask="+7 (___) ___-__-__" replacement={{ _: /\d/ }} />
  );
}

export const CustomComponentWithInnerState = {
  render: Component,
} satisfies StoryObj<typeof InputMask>;
