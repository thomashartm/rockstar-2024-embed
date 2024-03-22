/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

export default {
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
  ],
  coverageDirectory: 'coverage',
  coverageProvider: 'babel',
  fakeTimers: {
    enableGlobally: true,
  },
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['./test/jestenv.ts'],
};
