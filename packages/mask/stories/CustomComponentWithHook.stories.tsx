import React, { forwardRef, useState } from 'react';

import { InputMask, type MaskEventDetail, useMask } from '../src';

import type { Meta, StoryObj } from '@storybook/react';

export default {
  title: 'Mask',
  component: InputMask,
} satisfies Meta<typeof InputMask>;

interface ForwardedCustomComponentProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

function ForwardedCustomComponent(
  { label, ...props }: ForwardedCustomComponentProps,
  forwardedRef: React.ForwardedRef<HTMLInputElement>
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
  const [detail, setDetail] = useState<MaskEventDetail | null>(null);

  const ref = useMask({
    mask: '+7 (___) ___-__-__',
    replacement: { _: /\d/ },
    separate: true,
    showMask: true,
    onMask: (event) => {
      setDetail(event.detail);
    },
  });

  return (
    <>
      <CustomComponent ref={ref} label="Мой заголовок" id="custom-input" value={detail?.value} />

      <pre>{JSON.stringify(detail, null, 2)}</pre>
    </>
  );
}

export const CustomComponentWithHook = {
  render: Component,
} satisfies StoryObj<typeof InputMask>;
