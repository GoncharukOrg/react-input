import type { CustomInputEvent, CustomInputEventHandler } from '@react-input/core';

export type MaskPart = {
  type: 'replacement' | 'mask' | 'input';
  value: string;
  index: number;
};

export interface MaskEventDetail {
  /** Masked value (same as `event.target.value`). */
  value: string;
  /** Value without mask characters. */
  input: string;
  /**
   * Parts of the masked value, where each object contains the character type:
   * - `replacement` - the replacement character;
   * - `mask` - mask character;
   * - `input` is the character entered by the user.
   */
  parts: MaskPart[];
  /** A regular expression of type `string` that the masked value must match. */
  pattern: string;
  /** `true` if the mask is full and matches the pattern value. */
  isValid: boolean;
}

export type MaskEvent = CustomInputEvent<MaskEventDetail>;

export type MaskEventHandler = CustomInputEventHandler<MaskEvent>;

export interface Replacement {
  [key: string]: RegExp;
}

export interface ModifiedData {
  mask?: string;
  replacement?: string | Replacement;
  showMask?: boolean;
  separate?: boolean;
}

export type Modify = (input: string) => ModifiedData | undefined;

export interface MaskProps {
  /** Input mask, `replacement` is used to replace characters. */
  mask?: string;
  /** Sets the characters replaced in the mask, where "key" is the replaced character, "value" is the regular expression to which the input character must match (see «[Replacement](https://github.com/GoncharukBro/react-input/tree/main/packages/mask#replacement)»). It is possible to pass the replacement character as a string, then `replacement="_"` will default to `replacement={{ _: /./ }}`. Keys are ignored as you type. */
  replacement?: string | Replacement;
  /** Controls the display of the mask, for example, `+0 (123) ___-__-__` instead of `+0 (123`. */
  showMask?: boolean;
  /** Stores the position of the entered characters. By default, input characters are non-breaking, which means that if you remove characters in the middle of the value, the characters are shifted to the left, forming a non-breaking value, which is the behavior of `input`. For example, with `true`, the possible value is `+0 (123) ___-45-__`, with `false` - `+0 (123) 45_-__-__`. */
  separate?: boolean;
  /** Function triggered before masking. Allows you conditionally change the properties of the component that affect masking. Valid values ​​for modification are `mask`, `replacement`, `showMask` and `separate`. This is useful when you need conditionally tweak the displayed value to improve UX (see «[Modify](https://github.com/GoncharukBro/react-input/tree/main/packages/mask#modify)»). */
  modify?: Modify;
  /** Handler for the custom event `input-mask`. Called asynchronously after the `change` event, accessing the `detail` property containing additional useful information about the value. (see «[Mask event](https://github.com/GoncharukBro/react-input/tree/main/packages/mask#mask-event)»). */
  onMask?: MaskEventHandler;
}
