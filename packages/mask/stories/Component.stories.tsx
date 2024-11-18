// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import React, { forwardRef, useState } from 'react';

import InputMask from '../src/InputMask';

import type { InputMaskProps, TrackingData } from '../src';
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'mask/InputMask',
  component: InputMask,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof InputMask>;

export default meta;

type Story = StoryObj<typeof meta>;

interface CustomComponentProps extends React.InputHTMLAttributes<HTMLInputElement> {
  controlled?: boolean;
  label?: string;
}

const CustomComponent = forwardRef<HTMLInputElement, CustomComponentProps>(function CustomComponent(
  { controlled, label, ...props },
  ref,
) {
  const [value, setValue] = useState('');

  const control = {
    value,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue(event.target.value);
    },
  };

  return (
    <div>
      <label htmlFor="custom-input">{label}</label>
      <input ref={ref} id="custom-input" {...(controlled ? control : {})} {...props} />
    </div>
  );
});

function Component({ controlled = false, ...props }: InputMaskProps & { controlled?: boolean }) {
  const [value, setValue] = useState('');

  const control = {
    value,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue(event.target.value);
    },
  };

  return <InputMask {...(controlled ? control : {})} {...props} />;
}

export const UncontrolledComponent: Story = {
  args: {
    mask: '+7 (___) ___-__-__',
    replacement: { _: /\d/ },
    defaultValue: '+7 (___) ___-__-__',
    autoFocus: true,
  },
};

export const ControlledComponent: Story = {
  render: Component,
  args: {
    controlled: true,
    mask: '+7 (___) ___-__-__',
    replacement: { _: /\d/ },
  },
};

export const ControlledComponentWithModifyPhone: Story = {
  render: Component,
  args: {
    controlled: true,
    mask: '+_ (___) ___-__-__',
    replacement: { _: /\d/ },
    modify: ({ value, data, selectionStart }: TrackingData) => {
      const _data = (data ?? '').replace(/\D/, '');
      const beforeChange = value.slice(0, selectionStart);
      return {
        mask:
          (beforeChange.length <= 1 && _data.startsWith('7')) || beforeChange[1]?.startsWith('7')
            ? '+_ (___) ___-__-__'
            : '+_ __________',
      };
    },
  },
};

export const ControlledComponentWithTrackPhone: Story = {
  render: Component,
  args: {
    controlled: true,
    mask: '+_ (___) ___-__-__',
    replacement: { _: /\d/ },
    track: ({ inputType, value, data, selectionStart, selectionEnd }: TrackingData) => {
      if (inputType === 'insert' && selectionStart <= 1) {
        const _data = data.replace(/\D/g, '');
        return /^[78]/.test(_data) ? `7${_data.slice(1)}` : /^[0-69]/.test(_data) ? `7${_data}` : data;
      }

      if (inputType !== 'insert' && selectionStart <= 1 && selectionEnd < value.length) {
        return selectionEnd > 2 ? '7' : selectionEnd === 2 ? false : data;
      }

      return data;
    },
  },
};

export const CustomComponentWithOuterState: Story = {
  render: Component,
  args: {
    controlled: true,
    component: CustomComponent,
    label: 'Мой заголовок',
    mask: '+_ (___) ___-__-__',
    replacement: { _: /\d/ },
  },
};

export const CustomComponentWithInnerState: Story = {
  render: Component,
  args: {
    component: forwardRef<HTMLInputElement, CustomComponentProps>(function ForwardedCustomComponent(props, ref) {
      return <CustomComponent ref={ref} controlled {...props} />;
    }),
    label: 'Мой заголовок',
    mask: '+_ (___) ___-__-__',
    replacement: { _: /\d/ },
  },
};
