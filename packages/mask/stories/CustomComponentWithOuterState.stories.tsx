import { forwardRef, useState } from 'react';

import { InputMask } from '../src';

import type { MaskEventDetail } from '../src';
import type { Meta, StoryObj } from '@storybook/react';

export default {
  title: 'Mask',
  component: InputMask,
} satisfies Meta<typeof InputMask>;

interface ForwardedCustomComponentProps {
  label?: string;
  value: string;
}

function ForwardedCustomComponent(
  { label, value }: ForwardedCustomComponentProps,
  forwardedRef: React.ForwardedRef<HTMLInputElement>,
) {
  return (
    <>
      <label htmlFor="custom-input">{label}</label>
      <input ref={forwardedRef} id="custom-input" value={value} />
    </>
  );
}

const CustomComponent = forwardRef(ForwardedCustomComponent);

function Component() {
  const [detail, setDetail] = useState<MaskEventDetail | null>(null);

  return (
    <>
      <InputMask
        component={CustomComponent}
        label="Мой заголовок"
        mask="+7 (___) ___-__-__"
        replacement={{ _: /\d/ }}
        value={detail?.value ?? ''}
        onMask={(event) => {
          setDetail(event.detail);
        }}
      />

      <pre>{JSON.stringify(detail, null, 2)}</pre>
    </>
  );
}

export const CustomComponentWithOuterState = {
  render: Component,
} satisfies StoryObj<typeof InputMask>;
