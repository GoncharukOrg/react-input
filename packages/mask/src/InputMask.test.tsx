import React from 'react';

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { InputMask } from '.';

const user = userEvent.setup({ delay: 15 });

const init = () => {
  render(<InputMask mask="+7 (___) ___-__-__" replacement="_" data-testid="input-mask" />);
  return screen.getByTestId<HTMLInputElement>('input-mask');
};

const initWithDefaultType = async () => {
  const input = init();
  await user.type(input, '9123456789');
  return input;
};

test('Type', async () => {
  const input = await initWithDefaultType();
  expect(input).toHaveValue('+7 (912) 345-67-89');
});

test('Replace characters within the selected range', async () => {
  const input = await initWithDefaultType();
  await user.type(input, '0', { initialSelectionStart: 4, initialSelectionEnd: 8 });
  expect(input).toHaveValue('+7 (034) 567-89');
});

test('Backspace after user character', async () => {
  const input = await initWithDefaultType();
  await user.type(input, '{Backspace}', { initialSelectionStart: 5, initialSelectionEnd: 5 });
  expect(input).toHaveValue('+7 (123) 456-78-9');
});

test('Backspace after mask character', async () => {
  const input = await initWithDefaultType();
  await user.type(input, '{Backspace}', { initialSelectionStart: 8, initialSelectionEnd: 8 });
  expect(input).toHaveValue('+7 (912) 345-67-89');
});

test('Delete before user character', async () => {
  const input = await initWithDefaultType();
  await user.type(input, '{Delete}', { initialSelectionStart: 4, initialSelectionEnd: 4 });
  expect(input).toHaveValue('+7 (123) 456-78-9');
});

test('Delete before mask character', async () => {
  const input = await initWithDefaultType();
  await user.type(input, '{Delete}', { initialSelectionStart: 7, initialSelectionEnd: 7 });
  expect(input).toHaveValue('+7 (912) 345-67-89');
});
