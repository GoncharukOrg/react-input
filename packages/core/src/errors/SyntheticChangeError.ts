import type { InputAttributes } from '../types';

interface SyntheticChangeError {
  cause?: { __attributes?: Partial<InputAttributes> };
}

/**
 * A custom error is handled in the `useInput` hook with the ability
 * to pass attributes for setting on the `input` element.
 */
class SyntheticChangeError extends Error {
  constructor(message: string, cause?: SyntheticChangeError['cause']) {
    super(message);
    this.name = 'SyntheticChangeError';
    this.cause = cause;
  }
}

export default SyntheticChangeError;
