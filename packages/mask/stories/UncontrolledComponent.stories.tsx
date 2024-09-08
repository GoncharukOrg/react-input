import { InputMask } from '../src';

import type { Meta, StoryObj } from '@storybook/react';

export default {
  title: 'Mask',
  component: InputMask,
} satisfies Meta<typeof InputMask>;

function Component() {
  return <InputMask autoFocus defaultValue="+7 (___) ___-__-__" mask="+7 (___) ___-__-__" replacement={{ _: /\d/ }} />;
}

export const UncontrolledComponent = {
  render: Component,
} satisfies StoryObj<typeof InputMask>;
