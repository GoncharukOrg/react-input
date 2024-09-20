import React from 'react';

import { InputNumberFormat, NumberFormatOptions, useNumberFormat } from '../src';

import type { Meta, StoryObj } from '@storybook/react';

function Component(props: NumberFormatOptions) {
  const ref = useNumberFormat(props);

  return (
    <>
      <div>
        <p>{JSON.stringify(props)}</p>
        <input ref={ref} />
      </div>
    </>
  );
}

const meta = {
  title: 'number-format/useNumberFormat',
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
    locales: 'ru-RU',
    maximumIntegerDigits: 6,
  },
};

export const Story3: Story = {
  render: Component,
  args: {
    locales: 'ru-RU',
    format: 'currency',
    currency: 'RUB',
  },
};

export const Story4: Story = {
  render: Component,
  args: {
    locales: 'ja-JP',
    format: 'currency',
    currency: 'RUB',
  },
};

export const Story5: Story = {
  render: Component,
  args: {
    locales: 'ar-EG',
  },
};

export const Story6: Story = {
  render: Component,
  args: {
    locales: 'zh-Hans-CN-u-nu-hanidec',
  },
};
