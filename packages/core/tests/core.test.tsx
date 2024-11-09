import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useInput } from '@react-input/core';

import '@testing-library/jest-dom';

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const ref = useInput({
    init: ({ initialValue }) => ({
      value: initialValue,
      options: {},
    }),
    tracking: ({ value, selectionStart, selectionEnd }) => ({
      value,
      selectionStart,
      selectionEnd,
      options: {},
    }),
  });

  return <input ref={ref} autoFocus {...props} data-testid="testing-input" />;
}

/**
 * INSERT
 */

test('Insert with autofocus', async () => {
  render(<Input />);

  const input = screen.getByTestId<HTMLInputElement>('testing-input');

  await userEvent.type(input, '9123456789');
  expect(input).toHaveValue('9123456789');
});
