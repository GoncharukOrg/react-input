import { forwardRef, useState } from 'react';

import { InputMask, useMask } from '../src';

import type { Meta, StoryObj } from '@storybook/react';

export default {
  title: 'Mask',
  component: InputMask,
} satisfies Meta<typeof InputMask>;

interface ForwardedCustomComponentProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function ForwardedCustomComponent(
  { label, ...props }: ForwardedCustomComponentProps,
  forwardedRef: React.ForwardedRef<HTMLInputElement>,
) {
  return (
    <>
      <label htmlFor="custom-input">{label}</label>
      <input ref={forwardedRef} {...props} />
    </>
  );
}

const CustomComponent = forwardRef(ForwardedCustomComponent);

function Component() {
  const ref = useMask({
    mask: '+7 (___) ___-__-__',
    replacement: { _: /\d/ },
    separate: true,
    showMask: true,
  });

  const [value, setValue] = useState('');

  return (
    <CustomComponent
      ref={ref}
      id="custom-input"
      label="Мой заголовок"
      value={value}
      onChange={(event) => {
        setValue(event.target.value);
      }}
    />
  );
}

export const CustomComponentWithHook = {
  render: Component,
} satisfies StoryObj<typeof InputMask>;
