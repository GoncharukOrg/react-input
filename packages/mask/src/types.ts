import type { CustomInputEvent, CustomInputEventHandler } from '@react-input/core';

export type MaskPart = {
  type: 'replacement' | 'mask' | 'input';
  value: string;
  index: number;
};

export interface MaskEventDetail {
  value: string;
  input: string;
  parts: MaskPart[];
  pattern: string;
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
  mask?: string;
  replacement?: string | Replacement;
  showMask?: boolean;
  separate?: boolean;
  modify?: Modify;
  onMask?: MaskEventHandler;
}
