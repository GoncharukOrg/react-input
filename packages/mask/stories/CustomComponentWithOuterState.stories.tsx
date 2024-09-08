import { forwardRef, useState } from 'react';

import { InputMask } from '../src';

import type { Meta, StoryObj } from '@storybook/react';

export default {
  title: 'Mask',
  component: InputMask,
} satisfies Meta<typeof InputMask>;

interface ForwardedCustomComponentProps {
  label?: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function ForwardedCustomComponent(
  { label, ...props }: ForwardedCustomComponentProps,
  forwardedRef: React.ForwardedRef<HTMLInputElement>,
) {
  return (
    <>
      <label htmlFor="custom-input">{label}</label>
      <input ref={forwardedRef} id="custom-input" {...props} />
    </>
  );
}

const CustomComponent = forwardRef(ForwardedCustomComponent);

function Component() {
  const [value, setValue] = useState('');

  return (
    <InputMask
      component={CustomComponent}
      label="Мой заголовок"
      mask="+7 (___) ___-__-__"
      replacement={{ _: /\d/ }}
      value={value}
      onChange={(event) => {
        setValue(event.target.value);
      }}
    />
  );
}

export const CustomComponentWithOuterState = {
  render: Component,
} satisfies StoryObj<typeof InputMask>;
