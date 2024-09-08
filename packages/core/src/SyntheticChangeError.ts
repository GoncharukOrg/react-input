/**
 * Кастомная ошибка обрабатывается в хуке `useInput`.
 */
export default class SyntheticChangeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SyntheticChangeError';
  }
}
