import type { InputAttributes } from '../types';

export default function setInputAttributes(
  inputElement: HTMLInputElement,
  { value, selectionStart, selectionEnd }: Partial<InputAttributes>
) {
  // It's important to set the cursor position after setting the value,
  // as after setting the value, the cursor automatically moves to the end of the value.

  if (value !== undefined) {
    // eslint-disable-next-line no-param-reassign
    inputElement.value = value;
  }

  if (selectionStart !== undefined && selectionEnd !== undefined) {
    inputElement.setSelectionRange(selectionStart, selectionEnd);
  }
}
