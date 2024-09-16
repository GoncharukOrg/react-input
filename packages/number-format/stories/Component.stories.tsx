import { InputNumberFormat, NumberFormatOptions } from '../src';

import type { Meta, StoryObj } from '@storybook/react';

function Component(props: NumberFormatOptions) {
  return (
    <>
      <div>
        <p>{JSON.stringify(props)}</p>
        <InputNumberFormat {...props} />
      </div>
    </>
  );
}

const meta = {
  title: 'number-format/InputNumberFormat',
  component: InputNumberFormat,
  tags: ['autodocs'],
} satisfies Meta<typeof InputNumberFormat>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Story1: Story = {
  render: Component,
  args: {},
};

export const Story2: Story = {
  render: Component,
  args: {
    locales: 'de-DE',
    format: 'currency',
    currency: 'EUR',
  },
};

export const Story3: Story = {
  render: Component,
  args: {
    locales: 'ja-JP',
    format: 'currency',
    currency: 'JPY',
  },
};

export const Story4: Story = {
  render: Component,
  args: {
    locales: 'en-IN',
    maximumIntegerDigits: 3,
  },
};

export const Story5: Story = {
  render: Component,
  args: {
    locales: 'pt-PT',
    format: 'unit',
    unit: 'kilometer-per-hour',
  },
};

export const Story6: Story = {
  render: Component,
  args: {
    locales: 'en-GB',
    format: 'unit',
    unit: 'liter',
    unitDisplay: 'long',
  },
};
