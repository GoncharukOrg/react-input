import React, { forwardRef, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { InputMask, type MaskEventDetail } from '../src';

export default {
  title: 'Mask',
  component: InputMask,
} satisfies Meta<typeof InputMask>;

const CustomComponent = forwardRef(
  (
    { label, value }: { label?: string; value: string },
    forwardedRef: React.ForwardedRef<HTMLInputElement>
  ) => {
    return (
      <>
        <label htmlFor="custom-input">{label}</label>
        <input ref={forwardedRef} id="custom-input" value={value} />
      </>
    );
  }
);

function StoryCustomComponentWithOuterState() {
  const [detail, setDetail] = useState<MaskEventDetail | null>(null);

  return (
    <>
      <InputMask
        component={CustomComponent}
        label="Мой заголовок"
        mask="+7 (___) ___-__-__"
        replacement={{ _: /\d/ }}
        value={detail?.value ?? ''}
        onMask={(event) => setDetail(event.detail)}
      />

      <pre>{JSON.stringify(detail, null, 2)}</pre>
    </>
  );
}

export const CustomComponentWithOuterState = {
  render: StoryCustomComponentWithOuterState,
} satisfies StoryObj<typeof InputMask>;
