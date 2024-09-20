import React, { useState } from 'react';

import { InputMask } from '../src';

import type { Meta, StoryObj } from '@storybook/react';

export default {
  title: 'Mask',
  component: InputMask,
} satisfies Meta<typeof InputMask>;

function Component() {
  const [state, setState] = useState({
    mask: '+7 (___) ___-__-__',
    replacement: 'd',
    showMask: true,
    separate: false,
  });

  const [value, setValue] = useState('fegoj0fwfwe');

  return (
    <>
      <InputMask
        // defaultValue="fegoj0fwfwe"
        mask={state.mask}
        replacement={{ _: new RegExp(`\\${state.replacement}`) }}
        separate={state.separate}
        showMask={state.showMask}
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
        }}
      />

      <button
        type="button"
        onClick={() => {
          setState((prev) => ({
            ...prev,
            mask: prev.mask === '+7 (___) ___-__-__' ? '___-___' : '+7 (___) ___-__-__',
          }));
        }}
      >
        Изменить mask
      </button>

      <button
        type="button"
        onClick={() => {
          setState((prev) => ({ ...prev, replacement: prev.replacement === 'd' ? 'w' : 'd' }));
        }}
      >
        Изменить replacement
      </button>

      <button
        type="button"
        onClick={() => {
          setState((prev) => ({ ...prev, showMask: !prev.showMask }));
        }}
      >
        Изменить showMask
      </button>

      <button
        type="button"
        onClick={() => {
          setState((prev) => ({ ...prev, separate: !prev.separate }));
        }}
      >
        Изменить separate
      </button>

      <pre>{JSON.stringify({ state }, null, 2)}</pre>
    </>
  );
}

export const TestProps = {
  render: Component,
} satisfies StoryObj<typeof InputMask>;
