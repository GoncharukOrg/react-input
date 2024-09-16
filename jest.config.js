/**
 * @returns {Promise<import('jest').Config>}
 */
export default async () => ({
  clearMocks: true,
  testEnvironment: 'jsdom',
});
