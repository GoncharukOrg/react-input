export type Overlap = 'full' | 'full-inexact' | 'partial' | 'partial-inexact';

export interface MaskPart {
  type: 'replacement' | 'mask' | 'input';
  value: string;
  index: number;
}

export type Replacement = Record<string, RegExp>;

export type TrackingData = (
  | { inputType: 'insert'; data: string }
  | { inputType: 'deleteBackward' | 'deleteForward'; data: null }
) & {
  value: string;
  selectionStart: number;
  selectionEnd: number;
};

export type Track = (data: TrackingData) => string | boolean | null | undefined;

export interface ModifiedData {
  mask?: string;
  replacement?: string | Replacement;
  showMask?: boolean;
  separate?: boolean;
}

export type Modify = (data: TrackingData) => ModifiedData | undefined;

export interface MaskOptions {
  /** Input mask, `replacement` is used to replace characters. */
  mask?: string;
  /** Sets the characters replaced in the mask, where "key" is the replaced character, "value" is the regular expression to which the input character must match (see «[Replacement](https://github.com/GoncharukOrg/react-input/tree/main/packages/mask#replacement)»). It is possible to pass the replacement character as a string, then `replacement="_"` will default to `replacement={{ _: /./ }}`. Keys are ignored as you type. */
  replacement?: string | Replacement;
  /** Controls the display of the mask, for example, `+0 (123) ___-__-__` instead of `+0 (123`. */
  showMask?: boolean;
  /** Stores the position of the entered characters. By default, input characters are non-breaking, which means that if you remove characters in the middle of the value, the characters are shifted to the left, forming a non-breaking value, which is the behavior of `input`. For example, with `true`, the possible value is `+0 (123) ___-45-__`, with `false` - `+0 (123) 45_-__-__`. */
  separate?: boolean;
  /** The function is activated before masking. Allows you to conditionally change the entered value (see «[Track](https://github.com/GoncharukOrg/react-input/tree/main/packages/mask#track)»). */
  track?: Track;
  /** Function triggered before masking. Allows you conditionally change the properties of the component that affect masking. Valid values for modification are `mask`, `replacement`, `showMask` and `separate`. This is useful when you need conditionally tweak the displayed value to improve UX (see «[Modify](https://github.com/GoncharukOrg/react-input/tree/main/packages/mask#modify)»). */
  modify?: Modify;
}
